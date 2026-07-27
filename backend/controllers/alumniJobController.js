const Job = require("../models/Job");
const Application = require("../models/Application");
const Student = require("../models/Student");

// Builds the { applicants: [{avatarUrl}], applicantCount } shown as the
// avatar-stack + count in the postings table.
const attachApplicantInfo = async (job) => {
  const applications = await Application.find({ job: job._id })
    .populate("student", "fullName")
    .limit(3);

  const applicants = await Promise.all(
    applications.map(async (app) => {
      const studentProfile = await Student.findOne({ user: app.student._id });
      return { _id: app.student._id, avatarUrl: studentProfile?.avatarUrl };
    })
  );

  const applicantCount = await Application.countDocuments({ job: job._id });

  return {
    _id: job._id,
    title: job.title,
    department: job.department,
    location: job.location,
    status: job.status,
    datePosted: new Date(job.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    applicants,
    applicantCount,
  };
};

// @route  GET /api/alumni/jobs?page=&pageSize=
// Returns this alumni's own postings (paginated) plus summary stats.
const getMyJobs = async (req, res) => {
  try {
    const alumniUserId = req.user.id;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 4;
    const skip = (page - 1) * pageSize;

    const [jobDocs, totalCount, allMyJobs] = await Promise.all([
      Job.find({ postedBy: alumniUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Job.countDocuments({ postedBy: alumniUserId }),
      Job.find({ postedBy: alumniUserId }, "_id status createdAt"),
    ]);

    const jobs = await Promise.all(jobDocs.map(attachApplicantInfo));

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = allMyJobs.filter((j) => j.createdAt >= oneWeekAgo).length;

    const jobIds = allMyJobs.map((j) => j._id);
    const [totalApplicants, unreadApplicants] = await Promise.all([
      Application.countDocuments({ job: { $in: jobIds } }),
      Application.countDocuments({ job: { $in: jobIds }, status: "applied" }),
    ]);

    const closedCount = allMyJobs.filter((j) => j.status === "Closed").length;
    const fillRate = allMyJobs.length
      ? Math.round((closedCount / allMyJobs.length) * 100)
      : 0;

    res.json({
      jobs,
      totalCount,
      stats: {
        totalPostings: totalCount,
        newThisWeek,
        totalApplicants,
        unreadApplicants,
        fillRate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/alumni/jobs/:id
// Only the alumni who posted the job can delete it.
const deleteMyJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Clean up related applications so they don't dangle
    await Application.deleteMany({ job: req.params.id });

    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMyJobs, deleteMyJob };