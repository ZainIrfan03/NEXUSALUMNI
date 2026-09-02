const Alumni = require("../models/Alumni");
const Student = require("../models/Student");
const MentorshipRequest = require("../models/MentorshipRequest");
const AppError = require("../errors/AppError");
const {
  HTTP_STATUS,
  MENTEE_PROGRESS,
  MENTORSHIP_STATUS,
  PAGINATION,
} = require("../constants");

const getRecommendedMentors = () =>
  Alumni.find({ isPublic: true, openToMentorship: true })
    .populate("user", "fullName email")
    .limit(PAGINATION.RECOMMENDED_MENTORS_LIMIT);

const sendRequest = async ({ alumniId, message, studentUserId }) => {
  if (!alumniId) {
    throw new AppError("alumniId is required", HTTP_STATUS.BAD_REQUEST);
  }
  const alumni = await Alumni.findById(alumniId);
  if (!alumni) throw new AppError("Alumni not found", HTTP_STATUS.NOT_FOUND);

  const existingPending = await MentorshipRequest.findOne({
    student: studentUserId,
    alumni: alumni.user,
    status: MENTORSHIP_STATUS.PENDING,
  });
  if (existingPending) {
    throw new AppError(
      "You already have a pending request with this mentor",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
  return MentorshipRequest.create({ student: studentUserId, alumni: alumni.user, message });
};

const getStudentRequests = (studentUserId) =>
  MentorshipRequest.find({ student: studentUserId })
    .populate("alumni", "fullName email")
    .sort({ createdAt: -1 });

const formatRequest = async (request) => {
  const profile = await Student.findOne({ user: request.student._id });
  return {
    _id: request._id,
    name: request.student.fullName,
    major: profile?.department || "",
    classYear: profile?.session?.split("-")[1] || profile?.session || "",
    tag: profile?.skills?.[0] || null,
    message: request.message,
    avatarUrl: profile?.avatarUrl,
  };
};

const formatMentee = async (request) => {
  const profile = await Student.findOne({ user: request.student._id });
  return {
    _id: request._id,
    studentUserId: request.student._id,
    name: request.student.fullName,
    department: profile?.department || "",
    yearLabel: profile?.session ? `Session ${profile.session}` : "",
    status: MENTEE_PROGRESS.ON_TRACK,
    lastInteraction: new Date(request.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    avatarUrl: profile?.avatarUrl,
  };
};

const getAlumniOverview = async (alumniUserId) => {
  const [pendingDocs, acceptedDocs] = await Promise.all([
    MentorshipRequest.find({
      alumni: alumniUserId,
      status: MENTORSHIP_STATUS.PENDING,
    }).populate("student", "fullName").sort({ createdAt: -1 }),
    MentorshipRequest.find({
      alumni: alumniUserId,
      status: MENTORSHIP_STATUS.ACCEPTED,
    }).populate("student", "fullName").sort({ updatedAt: -1 }),
  ]);
  const [requests, mentees] = await Promise.all([
    Promise.all(pendingDocs.map(formatRequest)),
    Promise.all(acceptedDocs.map(formatMentee)),
  ]);
  return { activeMenteesCount: mentees.length, requests, mentees };
};

const updateRequestStatus = async ({ requestId, alumniUserId, status }) => {
  const request = await MentorshipRequest.findOneAndUpdate(
    { _id: requestId, alumni: alumniUserId },
    { status },
    { new: true },
  );
  if (!request) throw new AppError("Request not found", HTTP_STATUS.NOT_FOUND);
  return request;
};

module.exports = {
  getAlumniOverview,
  getRecommendedMentors,
  getStudentRequests,
  sendRequest,
  updateRequestStatus,
};
