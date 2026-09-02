const Job = require("../models/Job");
const Application = require("../models/Application");
const Student = require("../models/Student");
const AppError = require("../errors/AppError");
const {
  APPLICATION_STATUS,
  HTTP_STATUS,
  INTERVIEW_RESPONSE,
  JOB_FILTER,
  JOB_SORT,
  JOB_STATS_WINDOW_MS,
  JOB_STATUS,
  PAGINATION,
  ROLES,
} = require("../constants");

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const activeJobFilter = () => ({
  status: JOB_STATUS.ACTIVE,
  $or: [
    { deadline: { $exists: false } },
    { deadline: null },
    { deadline: { $gte: new Date() } },
  ],
});

const getJobs = async ({ query, user }) => {
  const {
    type, search, location, department, experienceLevel, savedOnly,
    sort = JOB_SORT.NEWEST,
  } = query;
  const page = Math.max(PAGINATION.DEFAULT_PAGE, Number(query.page) || PAGINATION.DEFAULT_PAGE);
  const pageSize = Math.min(
    PAGINATION.JOBS_MAX_PAGE_SIZE,
    Math.max(1, Number(query.pageSize) || PAGINATION.JOBS_DEFAULT_PAGE_SIZE),
  );
  const filter = activeJobFilter();

  if (type && type !== JOB_FILTER.ALL_TYPES) filter.type = type;
  if (department) filter.department = department;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (location) filter.location = { $regex: escapeRegExp(location), $options: "i" };
  if (search) {
    const pattern = { $regex: escapeRegExp(search), $options: "i" };
    filter.$and = [{ $or: [{ title: pattern }, { company: pattern }, { description: pattern }] }];
  }
  if (savedOnly === "true") filter.savedBy = user.id;

  const sortOptions = {
    [JOB_SORT.OLDEST]: { createdAt: 1 },
    [JOB_SORT.DEADLINE]: { deadline: 1, createdAt: -1 },
    [JOB_SORT.NEWEST]: { createdAt: -1 },
  };
  const [jobDocs, totalCount, applications] = await Promise.all([
    Job.find(filter)
      .select("-savedBy")
      .populate("postedBy", "fullName")
      .sort(sortOptions[sort] || sortOptions[JOB_SORT.NEWEST])
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Job.countDocuments(filter),
    user.role === ROLES.STUDENT
      ? Application.find({ student: user.id }, "job")
      : Promise.resolve([]),
  ]);

  const appliedJobIds = new Set(applications.map(({ job }) => String(job)));
  const savedJobIds = new Set(
    (await Job.find({
      _id: { $in: jobDocs.map(({ _id }) => _id) },
      savedBy: user.id,
    }).select("_id")).map(({ _id }) => String(_id)),
  );
  const jobs = jobDocs.map((job) => ({
    ...job.toObject(),
    hasApplied: appliedJobIds.has(String(job._id)),
    hasSaved: savedJobIds.has(String(job._id)),
  }));

  return {
    jobs,
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
};

const createJob = (data, postedBy) => {
  const {
    title,
    company,
    location,
    department,
    type,
    status,
    payRange,
    description,
    requirements,
    experienceLevel,
    deadline,
  } = data;
  return Job.create({
    title,
    company,
    location,
    department,
    type,
    status,
    payRange,
    description,
    requirements,
    experienceLevel,
    deadline: deadline || undefined,
    postedBy,
  });
};

const applyToJob = async ({ jobId, userId }) => {
  const job = await Job.findOne({ _id: jobId, ...activeJobFilter() });
  if (!job) {
    throw new AppError(
      "This job is closed, expired, or no longer available",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  const student = await Student.findOne({ user: userId }).select("resumeUrl");
  if (!student?.resumeUrl) {
    const error = new AppError("Please upload your resume before applying", HTTP_STATUS.BAD_REQUEST);
    error.code = "RESUME_REQUIRED";
    throw error;
  }
  try {
    return await Application.create({ job: job._id, student: userId, resumeUrl: student.resumeUrl });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("You already applied to this job", HTTP_STATUS.BAD_REQUEST);
    }
    throw error;
  }
};

const toggleSaveJob = async ({ jobId, userId }) => {
  const job = await Job.findOne({ _id: jobId, ...activeJobFilter() });
  if (!job) throw new AppError("Job not available", HTTP_STATUS.NOT_FOUND);
  const alreadySaved = job.savedBy.some((id) => id.toString() === userId);
  if (alreadySaved) job.savedBy.pull(userId);
  else job.savedBy.push(userId);
  await job.save();
  return { saved: !alreadySaved };
};

const getMyApplications = async (userId) => {
  const applications = await Application.find({ student: userId })
    .populate("job", "title company location type status deadline")
    .sort({ createdAt: -1 });
  const stats = Object.values(APPLICATION_STATUS).reduce(
    (result, status) => ({ ...result, [status]: 0 }),
    { total: applications.length },
  );
  applications.forEach(({ status }) => { stats[status] += 1; });
  return {
    stats,
    applications: applications.filter(({ job }) => job).map((application) => ({
      _id: application._id,
      status: application.status,
      appliedAt: application.createdAt,
      resumeUrl: application.resumeUrl,
      interview: application.interview || null,
      job: application.job,
    })),
  };
};

const respondToInterview = async ({ applicationId, userId, response }) => {
  const application = await Application.findOne({ _id: applicationId, student: userId }).populate("job");
  if (!application) throw new AppError("Application not found", HTTP_STATUS.NOT_FOUND);
  if (!application.interview) {
    throw new AppError("No interview has been scheduled", HTTP_STATUS.BAD_REQUEST);
  }
  application.interview.response = response;
  await application.save();
  return {
    recipientId: String(application.job.postedBy),
    payload: {
      applicationId: application._id,
      jobId: application.job._id,
      studentId: application.student,
      response: application.interview.response,
    },
  };
};

const attachApplicantInfo = async (job) => {
  const applications = await Application.find({ job: job._id })
    .populate("student", "fullName")
    .limit(PAGINATION.APPLICANT_PREVIEW_LIMIT);
  const applicants = await Promise.all(applications.map(async (application) => {
    const profile = await Student.findOne({ user: application.student._id });
    return { _id: application.student._id, avatarUrl: profile?.avatarUrl };
  }));
  return {
    _id: job._id,
    title: job.title,
    department: job.department,
    location: job.location,
    status: job.status,
    datePosted: new Date(job.createdAt).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    applicants,
    applicantCount: await Application.countDocuments({ job: job._id }),
  };
};

const getPostedJobs = async ({ userId, query }) => {
  const page = Number(query.page) || PAGINATION.DEFAULT_PAGE;
  const pageSize = Number(query.pageSize) || PAGINATION.ALUMNI_JOBS_PAGE_SIZE;
  const [jobDocs, totalCount, allJobs] = await Promise.all([
    Job.find({ postedBy: userId }).sort({ createdAt: -1 })
      .skip((page - 1) * pageSize).limit(pageSize),
    Job.countDocuments({ postedBy: userId }),
    Job.find({ postedBy: userId }, "_id status createdAt"),
  ]);
  const jobs = await Promise.all(jobDocs.map(attachApplicantInfo));
  const jobIds = allJobs.map(({ _id }) => _id);
  const [totalApplicants, unreadApplicants] = await Promise.all([
    Application.countDocuments({ job: { $in: jobIds } }),
    Application.countDocuments({ job: { $in: jobIds }, status: APPLICATION_STATUS.APPLIED }),
  ]);
  const closedCount = allJobs.filter(({ status }) => status === JOB_STATUS.CLOSED).length;
  return {
    jobs,
    totalCount,
    stats: {
      totalPostings: totalCount,
      newThisWeek: allJobs.filter(({ createdAt }) =>
        createdAt >= new Date(Date.now() - JOB_STATS_WINDOW_MS)).length,
      totalApplicants,
      unreadApplicants,
      fillRate: allJobs.length ? Math.round((closedCount / allJobs.length) * 100) : 0,
    },
  };
};

const deletePostedJob = async ({ jobId, userId }) => {
  const job = await Job.findOneAndDelete({ _id: jobId, postedBy: userId });
  if (!job) throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND);
  await Application.deleteMany({ job: jobId });
};

const getJobApplicants = async ({ jobId, userId }) => {
  const job = await Job.findOne({ _id: jobId, postedBy: userId });
  if (!job) throw new AppError("Job not found", HTTP_STATUS.NOT_FOUND);
  const applications = await Application.find({ job: job._id })
    .populate("student", "fullName email").sort({ createdAt: -1 });
  const profiles = await Student.find(
    { user: { $in: applications.map(({ student }) => student._id) } },
    "user avatarUrl department session resumeUrl",
  );
  const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));
  return {
    job: { _id: job._id, title: job.title },
    applicants: applications.map((application) => {
      const profile = profileMap.get(String(application.student._id));
      return {
        applicationId: application._id,
        studentId: application.student._id,
        profileId: profile?._id,
        fullName: application.student.fullName,
        email: application.student.email,
        avatarUrl: profile?.avatarUrl || null,
        department: profile?.department,
        session: profile?.session,
        resumeUrl: application.resumeUrl || profile?.resumeUrl || null,
        status: application.status,
        interview: application.interview || null,
        appliedAt: application.createdAt,
      };
    }),
  };
};

const getOwnedApplication = async (applicationId, userId, action) => {
  const application = await Application.findById(applicationId).populate("job");
  if (!application) throw new AppError("Application not found", HTTP_STATUS.NOT_FOUND);
  if (String(application.job.postedBy) !== userId) {
    throw new AppError(`Not authorized to ${action}`, HTTP_STATUS.FORBIDDEN);
  }
  return application;
};

const updateApplicationStatus = async ({ applicationId, userId, status }) => {
  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    throw new AppError("Invalid status", HTTP_STATUS.BAD_REQUEST);
  }
  if (status === APPLICATION_STATUS.INTERVIEW) {
    throw new AppError(
      "Schedule the interview date and meeting link first",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  const application = await getOwnedApplication(applicationId, userId, "update this application");
  application.status = status;
  await application.save();
  return { applicationId: application._id, status: application.status };
};

const scheduleInterview = async ({ applicationId, userId, data }) => {
  const application = await getOwnedApplication(applicationId, userId, "schedule this interview");
  application.status = APPLICATION_STATUS.INTERVIEW;
  application.interview = {
    scheduledAt: new Date(data.scheduledAt),
    timezone: data.timezone,
    durationMinutes: data.durationMinutes,
    meetingUrl: data.meetingUrl,
    instructions: data.instructions,
    response: INTERVIEW_RESPONSE.PENDING,
  };
  await application.save();
  return {
    recipientId: String(application.student),
    payload: {
      applicationId: application._id,
      jobId: application.job._id,
      jobTitle: application.job.title,
      status: application.status,
      interview: application.interview,
    },
  };
};

module.exports = {
  applyToJob,
  createJob,
  deletePostedJob,
  getJobApplicants,
  getJobs,
  getMyApplications,
  getPostedJobs,
  respondToInterview,
  scheduleInterview,
  toggleSaveJob,
  updateApplicationStatus,
};
