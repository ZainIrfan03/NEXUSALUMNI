const Job = require("../models/Job");
const Application = require("../models/Application");

// @route  GET /api/jobs?type=Full-time
// Any logged-in user can browse jobs; `type` filters by tab
// ("All Jobs" sends no type param).
const getJobs = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type && type !== "All Jobs" ? { type } : {};

    const jobs = await Job.find(filter)
      .populate("postedBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/jobs
// Alumni-only — creates a new job posting.
const createJob = async (req, res) => {
  try {
    const { title, company, location, department, type, status, payRange, description } = req.body;

    if (!title || !company || !location || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await Job.create({
      title,
      company,
      location,
      department,
      type,
      status,
      payRange,
      description,
      postedBy: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/jobs/:id/apply
// Student-only — applies to a job. Blocks duplicate applications.
const applyToJob = async (req, res) => {
  try {
    const application = await Application.create({
      job: req.params.id,
      student: req.user.id,
    });
    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already applied to this job" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/jobs/:id/save
// Student-only — toggles the bookmark icon on/off.
const toggleSaveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const studentId = req.user.id;
    const alreadySaved = job.savedBy.some((id) => id.toString() === studentId);

    if (alreadySaved) {
      job.savedBy = job.savedBy.filter((id) => id.toString() !== studentId);
    } else {
      job.savedBy.push(studentId);
    }

    await job.save();
    res.json({ saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/jobs/my-applications
// Student-only — powers the Application Tracking counts.
const getMyApplicationStats = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id });

    const stats = {
      applied: applications.length,
      in_review: applications.filter((a) => a.status === "in_review").length,
      interview: applications.filter((a) => a.status === "interview").length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getJobs, createJob, applyToJob, toggleSaveJob, getMyApplicationStats };