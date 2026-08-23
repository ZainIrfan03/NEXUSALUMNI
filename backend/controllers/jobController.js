const Job = require("../models/Job");
const Application = require("../models/Application");
const Student = require("../models/Student");
const AppError = require("../utils/AppError");
const {
  HTTP_STATUS,
  JOB_STATUS,
  APPLICATION_STATUS,
  SOCKET_EVENTS,
} = require("../utils/constants");

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const activeJobFilter = () => ({
  status: JOB_STATUS.ACTIVE,
  $or: [
    { deadline: { $exists: false } },
    { deadline: null },
    { deadline: { $gte: new Date() } },
  ],
});

const getJobs = async (req, res) => {
  const {
    type,
    search,
    location,
    department,
    experienceLevel,
    savedOnly,
    sort = "newest",
  } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(req.query.pageSize) || 6));
  const filter = activeJobFilter();

  if (type && type !== "All Jobs") filter.type = type;
  if (department) filter.department = department;
  if (experienceLevel) filter.experienceLevel = experienceLevel;
  if (location) filter.location = { $regex: escapeRegExp(location), $options: "i" };
  if (search) {
    const pattern = { $regex: escapeRegExp(search), $options: "i" };
    filter.$and = [{ $or: [{ title: pattern }, { company: pattern }, { description: pattern }] }];
  }
  if (savedOnly === "true") filter.savedBy = req.user.id;

  const sortOptions = {
    oldest: { createdAt: 1 },
    deadline: { deadline: 1, createdAt: -1 },
    newest: { createdAt: -1 },
  };

  const [jobDocs, totalCount, applications] = await Promise.all([
    Job.find(filter)
      .select("-savedBy")
      .populate("postedBy", "fullName")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Job.countDocuments(filter),
    req.user.role === "student"
      ? Application.find({ student: req.user.id }, "job")
      : Promise.resolve([]),
  ]);

  const appliedJobIds = new Set(applications.map((application) => String(application.job)));
  const savedJobIds = new Set(
    (
      await Job.find({
        _id: { $in: jobDocs.map((job) => job._id) },
        savedBy: req.user.id,
      }).select("_id")
    ).map((job) => String(job._id))
  );

  const jobs = jobDocs.map((job) => ({
    ...job.toObject(),
    hasApplied: appliedJobIds.has(String(job._id)),
    hasSaved: savedJobIds.has(String(job._id)),
  }));

  res.json({
    jobs,
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  });
};

const createJob = async (req, res) => {
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
  } = req.body;

  const job = await Job.create({
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
    postedBy: req.user.id,
  });

  res.status(HTTP_STATUS.CREATED).json(job);
};

const applyToJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, ...activeJobFilter() });
    if (!job) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "This job is closed, expired, or no longer available",
      });
    }

    const student = await Student.findOne({ user: req.user.id }).select("resumeUrl");
    if (!student?.resumeUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Please upload your resume before applying",
        code: "RESUME_REQUIRED",
      });
    }

    const application = await Application.create({
      job: job._id,
      student: req.user.id,
      resumeUrl: student.resumeUrl,
    });
    res.status(HTTP_STATUS.CREATED).json(application);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("You already applied to this job", HTTP_STATUS.BAD_REQUEST);
    }
    throw error;
  }
};

const toggleSaveJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, ...activeJobFilter() });
  if (!job) return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Job not available" });

  const studentId = req.user.id;
  const alreadySaved = job.savedBy.some((id) => id.toString() === studentId);
  if (alreadySaved) job.savedBy.pull(studentId);
  else job.savedBy.push(studentId);

  await job.save();
  res.json({ saved: !alreadySaved });
};

const getMyApplications = async (req, res) => {
  const applications = await Application.find({ student: req.user.id })
    .populate("job", "title company location type status deadline")
    .sort({ createdAt: -1 });

  const stats = Object.values(APPLICATION_STATUS).reduce(
    (result, status) => ({ ...result, [status]: 0 }),
    { total: applications.length }
  );
  applications.forEach((application) => {
    stats[application.status] += 1;
  });

  res.json({
    stats,
    applications: applications
      .filter((application) => application.job)
      .map((application) => ({
        _id: application._id,
        status: application.status,
        appliedAt: application.createdAt,
        resumeUrl: application.resumeUrl,
        interview: application.interview || null,
        job: application.job,
      })),
  });
};

// @route PATCH /api/jobs/applications/:applicationId/interview-response
const respondToInterview = async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    student: req.user.id,
  }).populate("job");
  if (!application) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Application not found" });
  }
  if (!application.interview) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No interview has been scheduled" });
  }

  application.interview.response = req.body.response;
  await application.save();

  const payload = {
    applicationId: application._id,
    jobId: application.job._id,
    studentId: application.student,
    response: application.interview.response,
  };
  req.app
    .get("io")
    ?.to(String(application.job.postedBy))
    .emit(SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED, payload);

  res.json(payload);
};

module.exports = {
  getJobs,
  createJob,
  applyToJob,
  toggleSaveJob,
  getMyApplications,
  respondToInterview,
};
