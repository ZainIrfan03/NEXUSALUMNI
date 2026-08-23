const MentorshipRequest = require("../models/MentorshipRequest");
const Student = require("../models/Student");
const { HTTP_STATUS } = require("../utils/constants");

// Maps a MentorshipRequest doc (with populated student.user) into the
// shape the alumni-side frontend expects for a "request card".
const formatRequest = async (reqDoc) => {
  const studentProfile = await Student.findOne({ user: reqDoc.student._id });
  return {
    _id: reqDoc._id,
    name: reqDoc.student.fullName,
    major: studentProfile?.department || "",
    classYear: studentProfile?.session?.split("-")[1] || studentProfile?.session || "",
    tag: studentProfile?.skills?.[0] || null,
    message: reqDoc.message,
    avatarUrl: studentProfile?.avatarUrl,
  };
};

// Maps an accepted MentorshipRequest into the "current mentee" table row shape.
const formatMentee = async (reqDoc) => {
  const studentProfile = await Student.findOne({ user: reqDoc.student._id });
  return {
    _id: reqDoc._id, // the request id — used as the row key + for the Message link
    studentUserId: reqDoc.student._id,
    name: reqDoc.student.fullName,
    department: studentProfile?.department || "",
    yearLabel: studentProfile?.session ? `Session ${studentProfile.session}` : "",
    status: "On Track", // TODO: replace with a real tracked field once check-ins exist
    lastInteraction: new Date(reqDoc.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    avatarUrl: studentProfile?.avatarUrl,
  };
};

// @route  GET /api/alumni/mentorship
// Returns active mentee count, pending requests, and the current mentees table.
const getMentorshipOverview = async (req, res) => {
  const alumniUserId = req.user.id;

  const [pendingDocs, acceptedDocs] = await Promise.all([
    MentorshipRequest.find({ alumni: alumniUserId, status: "pending" })
      .populate("student", "fullName")
      .sort({ createdAt: -1 }),
    MentorshipRequest.find({ alumni: alumniUserId, status: "accepted" })
      .populate("student", "fullName")
      .sort({ updatedAt: -1 }),
  ]);

  const requests = await Promise.all(pendingDocs.map(formatRequest));
  const mentees = await Promise.all(acceptedDocs.map(formatMentee));

  res.json({
    activeMenteesCount: mentees.length,
    requests,
    mentees,
  });
};

// @route  POST /api/alumni/mentorship/requests/:id/accept
const acceptRequest = async (req, res) => {
  const request = await MentorshipRequest.findOneAndUpdate(
    { _id: req.params.id, alumni: req.user.id },
    { status: "accepted" },
    { new: true }
  );

  if (!request) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
  }

  res.json(request);
};

// @route  POST /api/alumni/mentorship/requests/:id/reject
const rejectRequest = async (req, res) => {
  const request = await MentorshipRequest.findOneAndUpdate(
    { _id: req.params.id, alumni: req.user.id },
    { status: "declined" },
    { new: true }
  );

  if (!request) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
  }

  res.json(request);
};

module.exports = { getMentorshipOverview, acceptRequest, rejectRequest };
