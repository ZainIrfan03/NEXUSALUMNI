const MentorshipRequest = require("../models/MentorshipRequest");
const Student = require("../models/Student");
const { HTTP_STATUS, MENTORSHIP_STATUS } = require("../constants");

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
// Returns active mentee count, pending requests, and the current mentees table.
const getMentorshipOverview = async (req, res) => {
  const alumniUserId = req.user.id;

  const [pendingDocs, acceptedDocs] = await Promise.all([
    MentorshipRequest.find({ alumni: alumniUserId, status: MENTORSHIP_STATUS.PENDING })
      .populate("student", "fullName")
      .sort({ createdAt: -1 }),
    MentorshipRequest.find({ alumni: alumniUserId, status: MENTORSHIP_STATUS.ACCEPTED })
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
const acceptRequest = async (req, res) => {
  const request = await MentorshipRequest.findOneAndUpdate(
    { _id: req.params.id, alumni: req.user.id },
    { status: MENTORSHIP_STATUS.ACCEPTED },
    { new: true }
  );

  if (!request) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
  }

  res.json(request);
};
const rejectRequest = async (req, res) => {
  const request = await MentorshipRequest.findOneAndUpdate(
    { _id: req.params.id, alumni: req.user.id },
    { status: MENTORSHIP_STATUS.DECLINED },
    { new: true }
  );

  if (!request) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Request not found" });
  }

  res.json(request);
};

module.exports = { getMentorshipOverview, acceptRequest, rejectRequest };
