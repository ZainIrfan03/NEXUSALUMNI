const MentorshipRequest = require("../models/MentorshipRequest");
const Job = require("../models/Job");

// @route  GET /api/alumni/dashboard
// Powers the stat cards + "Incoming Mentorship Requests" preview on the
// Alumni Dashboard page.
const getAlumniOverview = async (req, res) => {
  const alumniUserId = req.user.id;

  const [studentsMentored, jobsPosted, pendingRequests] = await Promise.all([
    // "Students mentored" = distinct students whose request was accepted
    MentorshipRequest.distinct("student", {
      alumni: alumniUserId,
      status: "accepted",
    }),
    Job.countDocuments({ postedBy: alumniUserId }),
    MentorshipRequest.find({ alumni: alumniUserId, status: "pending" })
      .populate("student", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    studentsMentored: studentsMentored.length,
    jobsPosted,
    incomingRequests: pendingRequests,
  });
};

module.exports = { getAlumniOverview };
