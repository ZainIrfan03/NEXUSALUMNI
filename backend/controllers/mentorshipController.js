const Alumni = require("../models/Alumni");
const MentorshipRequest = require("../models/MentorshipRequest");

// @route  GET /api/mentorship/recommended
// Returns alumni who are public and open to mentoring, for the student-side
// "Recommended Mentors" grid.
const getRecommendedMentors = async (req, res) => {
  try {
    const mentors = await Alumni.find({ isPublic: true, openToMentorship: true })
      .populate("user", "fullName email")
      .limit(20);

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/mentorship/request
// @body   { alumniId, message? }  — alumniId is the Alumni document's own _id
// Creates a mentorship request from the logged-in student to that alumni.
const sendMentorshipRequest = async (req, res) => {
  try {
    const { alumniId, message } = req.body;
    const studentUserId = req.user.id;

    if (!alumniId) {
      return res.status(400).json({ message: "alumniId is required" });
    }

    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Don't let a student spam the same alumni while a request is still pending.
    const existingPending = await MentorshipRequest.findOne({
      student: studentUserId,
      alumni: alumni.user,
      status: "pending",
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending request with this mentor" });
    }

    const request = await MentorshipRequest.create({
      student: studentUserId,
      alumni: alumni.user,
      message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/mentorship/my-requests
// Returns every mentorship request the logged-in student has sent, newest first —
// powers the "Request Status" panel.
const getMyRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ student: req.user.id })
      .populate("alumni", "fullName email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getRecommendedMentors, sendMentorshipRequest, getMyRequests };