const Alumni = require("../models/Alumni");
const MentorshipRequest = require("../models/MentorshipRequest");
const Job = require("../models/Job");

// @route  GET /api/student/dashboard
// Powers the 4 stat cards on the Student Overview page.
const getStudentOverview = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [totalAlumni, pendingRequests, savedJobsCount] = await Promise.all([
      Alumni.countDocuments(),
      MentorshipRequest.countDocuments({ student: studentId, status: "pending" }),
      Job.countDocuments({ savedBy: studentId }),
    ]);

    res.json({
      totalAlumni,
      pendingRequests,
      savedJobs: savedJobsCount,
      // upcomingEvents needs an Events model — wire this up once that's built
      upcomingEvents: 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getStudentOverview };