const { MENTORSHIP_STATUS } = require("../constants");
const mentorshipService = require("../services/mentorshipService");

const getMentorshipOverview = async (req, res) => {
  res.json(await mentorshipService.getAlumniOverview(req.user.id));
};

const updateStatus = (status) => async (req, res) => {
  res.json(await mentorshipService.updateRequestStatus({
    requestId: req.params.id,
    alumniUserId: req.user.id,
    status,
  }));
};

module.exports = {
  acceptRequest: updateStatus(MENTORSHIP_STATUS.ACCEPTED),
  getMentorshipOverview,
  rejectRequest: updateStatus(MENTORSHIP_STATUS.DECLINED),
};
