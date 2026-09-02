const { HTTP_STATUS } = require("../constants");
const mentorshipService = require("../services/mentorshipService");

const getRecommendedMentors = async (req, res) => {
  res.json(await mentorshipService.getRecommendedMentors());
};

const sendMentorshipRequest = async (req, res) => {
  const request = await mentorshipService.sendRequest({
    alumniId: req.body.alumniId,
    message: req.body.message,
    studentUserId: req.user.id,
  });
  res.status(HTTP_STATUS.CREATED).json(request);
};

const getMyRequests = async (req, res) => {
  res.json(await mentorshipService.getStudentRequests(req.user.id));
};

module.exports = { getMyRequests, getRecommendedMentors, sendMentorshipRequest };
