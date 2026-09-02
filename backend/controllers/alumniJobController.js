const { SOCKET_EVENTS } = require("../constants");
const jobService = require("../services/jobService");
const getMyJobs = async (req, res) => {
  res.json(await jobService.getPostedJobs({
    userId: req.user.id,
    query: req.query,
  }));
};
const deleteMyJob = async (req, res) => {
  await jobService.deletePostedJob({
    jobId: req.params.id,
    userId: req.user.id,
  });
  res.json({ message: "Job deleted" });
};
const getJobApplicants = async (req, res) => {
  res.json(await jobService.getJobApplicants({
    jobId: req.params.id,
    userId: req.user.id,
  }));
};
const updateApplicationStatus = async (req, res) => {
  res.json(await jobService.updateApplicationStatus({
    applicationId: req.params.applicationId,
    userId: req.user.id,
    status: req.body.status,
  }));
};
const scheduleInterview = async (req, res) => {
  const { recipientId, payload } = await jobService.scheduleInterview({
    applicationId: req.params.applicationId,
    userId: req.user.id,
    data: req.body,
  });
  req.app.get("io")?.to(recipientId).emit(
    SOCKET_EVENTS.INTERVIEW_SCHEDULED,
    payload,
  );
  res.json(payload);
};

module.exports = {
  getMyJobs,
  deleteMyJob,
  getJobApplicants,
  updateApplicationStatus,
  scheduleInterview,
};
