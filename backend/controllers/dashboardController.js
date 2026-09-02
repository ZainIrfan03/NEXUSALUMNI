const Alumni = require("../models/Alumni");
const MentorshipRequest = require("../models/MentorshipRequest");
const Job = require("../models/Job");
const { MENTORSHIP_STATUS } = require("../constants");
const getStudentOverview = async (req, res) => {
  const studentId = req.user.id;

  const [totalAlumni, pendingRequests, savedJobsCount] = await Promise.all([
    Alumni.countDocuments(),
    MentorshipRequest.countDocuments({ student: studentId, status: MENTORSHIP_STATUS.PENDING }),
    Job.countDocuments({ savedBy: studentId }),
  ]);

  res.json({
    totalAlumni,
    pendingRequests,
    savedJobs: savedJobsCount,
    upcomingEvents: 0,
  });
};

module.exports = { getStudentOverview };
