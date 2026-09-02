const MentorshipRequest = require("../models/MentorshipRequest");
const Job = require("../models/Job");
const { MENTORSHIP_STATUS } = require("../constants");
const getStudentActivity = async (req, res) => {
  const studentId = req.user.id;

  const [acceptedRequests, recentJobs] = await Promise.all([
    MentorshipRequest.find({ student: studentId, status: MENTORSHIP_STATUS.ACCEPTED })
      .populate("alumni", "fullName")
      .sort({ updatedAt: -1 })
      .limit(5),
    Job.find().sort({ createdAt: -1 }).limit(5),
  ]);

  const connectionEvents = acceptedRequests.map((r) => ({
    type: "connection",
    title: `${r.alumni?.fullName || "An alumnus"} accepted your connection request.`,
    desc: "Say hi and introduce yourself to your new connection.",
    date: r.updatedAt,
  }));

  const jobEvents = recentJobs.map((j) => ({
    type: "job",
    title: `New Job Match: ${j.title} at ${j.company}`,
    desc: `Posted in ${j.location}. Check it out before it's gone.`,
    date: j.createdAt,
  }));

  const feed = [...connectionEvents, ...jobEvents]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  res.json(feed);
};

module.exports = { getStudentActivity };
