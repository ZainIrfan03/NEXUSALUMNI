const MentorshipRequest = require("../models/MentorshipRequest");
const Job = require("../models/Job");
const { MENTORSHIP_STATUS, PAGINATION } = require("../constants");
const getAlumniOverview = async (req, res) => {
  const alumniUserId = req.user.id;

  const [studentsMentored, jobsPosted, pendingRequests] = await Promise.all([
    MentorshipRequest.distinct("student", {
      alumni: alumniUserId,
      status: MENTORSHIP_STATUS.ACCEPTED,
    }),
    Job.countDocuments({ postedBy: alumniUserId }),
    MentorshipRequest.find({ alumni: alumniUserId, status: MENTORSHIP_STATUS.PENDING })
      .populate("student", "fullName email")
      .sort({ createdAt: -1 })
      .limit(PAGINATION.DASHBOARD_REQUEST_LIMIT),
  ]);

  res.json({
    studentsMentored: studentsMentored.length,
    jobsPosted,
    incomingRequests: pendingRequests,
  });
};

module.exports = { getAlumniOverview };
