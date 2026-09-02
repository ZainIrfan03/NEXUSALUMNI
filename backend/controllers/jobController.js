const { HTTP_STATUS, SOCKET_EVENTS } = require("../constants");
const jobService = require("../services/jobService");

const getJobs = async (req, res) => {
  res.json(await jobService.getJobs({ query: req.query, user: req.user }));
};

const createJob = async (req, res) => {
  const job = await jobService.createJob(req.body, req.user.id);
  res.status(HTTP_STATUS.CREATED).json(job);
};

const applyToJob = async (req, res) => {
  const application = await jobService.applyToJob({
    jobId: req.params.id,
    userId: req.user.id,
  });
  res.status(HTTP_STATUS.CREATED).json(application);
};

const toggleSaveJob = async (req, res) => {
  res.json(await jobService.toggleSaveJob({
    jobId: req.params.id,
    userId: req.user.id,
  }));
};

const getMyApplications = async (req, res) => {
  res.json(await jobService.getMyApplications(req.user.id));
};

const respondToInterview = async (req, res) => {
  const { recipientId, payload } = await jobService.respondToInterview({
    applicationId: req.params.applicationId,
    userId: req.user.id,
    response: req.body.response,
  });
  req.app.get("io")?.to(recipientId).emit(
    SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED,
    payload,
  );
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
