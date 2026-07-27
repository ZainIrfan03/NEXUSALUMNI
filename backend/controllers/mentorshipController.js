const MentorshipRequest = require("../models/MentorshipRequest");
const User = require("../models/User");

// @route  GET /api/mentorship/recommended
// Returns a list of alumni the logged-in student can send a mentorship
// request to. Excludes alumni the student already has a pending or
// accepted request with.
const getRecommendedMentors = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Alumni already requested (pending/accepted) — don't recommend them again
    const existingRequests = await MentorshipRequest.find({
      student: studentId,
      status: { $in: ["pending", "accepted"] },
    }).select("alumni");

    const excludedAlumniIds = existingRequests.map((r) => r.alumni.toString());

    const mentors = await User.find({
      role: "alumni",
      _id: { $nin: excludedAlumniIds },
    }).select("fullName email profileImage department jobTitle company skills");

    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/mentorship/request
// @body   { alumniId, message }
// Student sends a mentorship request to a specific alumni.
const sendMentorshipRequest = async (req, res) => {
  try {
    const { alumniId, message } = req.body;
    const studentId = req.user.id;

    if (!alumniId) {
      return res.status(400).json({ message: "alumniId is required" });
    }

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== "alumni") {
      return res.status(404).json({ message: "Alumni not found" });
    }

    // Avoid duplicate pending requests to the same alumni
    const alreadyPending = await MentorshipRequest.findOne({
      student: studentId,
      alumni: alumniId,
      status: "pending",
    });

    if (alreadyPending) {
      return res.status(400).json({ message: "You already have a pending request with this alumni" });
    }

    const request = await MentorshipRequest.create({
      student: studentId,
      alumni: alumniId,
      message,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/mentorship/my-requests
// All mentorship requests the logged-in student has sent, most recent first.
const getMyRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ student: req.user.id })
      .populate("alumni", "fullName email profileImage department jobTitle company")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getRecommendedMentors,
  sendMentorshipRequest,
  getMyRequests,
};