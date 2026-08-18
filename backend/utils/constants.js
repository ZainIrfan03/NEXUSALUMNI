// Central place for backend-wide constant values.
// Add more constants here as duplicates are found (see Word report).

const path = require("path");

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
  INTERVIEW_SCHEDULED: "interviewScheduled",
  INTERVIEW_RESPONSE_UPDATED: "interviewResponseUpdated",
};

const AUTH_COOKIE_NAME = "token";
const JWT_PERSISTENT_EXPIRY = "5d";
const JWT_SESSION_EXPIRY = "1d";
const AUTH_COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;
const FRONTEND_URL = process.env.FRONTEND_URL;
const SERVER_PORT = process.env.PORT || 5000;

// Must exactly match FRONTEND/src/consts/appConstants.js -> ROLES
// (also used as the `enum` for models/User.js -> role)
const ROLES = {
  STUDENT: "student",
  ALUMNI: "alumni",
  FACULTY: "faculty",
  ADMIN: "admin",
};

// Must exactly match FRONTEND/src/consts/appConstants.js -> MENTORSHIP_STATUS
// (also used as the `enum` for models/MentorshipRequest.js -> status)
const MENTORSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  COMPLETED: "completed",
};

// Must exactly match FRONTEND/src/consts/appConstants.js -> APPLICATION_STATUS
// (also used as the `enum` for models/Application.js -> status)
const APPLICATION_STATUS = {
  APPLIED: "applied",
  IN_REVIEW: "in_review",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};


// Job posting fields — models/Job.js -> type / status enums
const JOB_TYPE = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

const JOB_STATUS = {
  ACTIVE: "Active",
  CLOSED: "Closed",
  DRAFT: "Draft",
};

const INTERVIEW_RESPONSE = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  RESCHEDULE_REQUESTED: "reschedule_requested",
};

const EXPERIENCE_LEVEL = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior Level",
};

// File upload size limits — middleware/uploadMiddleware.js
const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UPLOAD_DIRS = {
  AVATARS: path.join(__dirname, "..", "uploads", "avatars"),
  RESUMES: path.join(__dirname, "..", "uploads", "resumes"),
  CHAT: path.join(__dirname, "..", "uploads", "chat"),
};

const DEPARTMENT_LABELS = {
  cs: "Computer Science",
  business: "Business",
  engineering: "Engineering",
  design: "Design",
};

// Must exactly match FRONTEND/src/consts/appConstants.js -> PASSWORD_MIN_LENGTH / FULL_NAME_MAX_LENGTH
// (Register.jsx enforces these client-side; validators/authValidators.js
// enforces them again server-side since a client check is bypassable.)
const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MAX_LENGTH = 15;

module.exports = {
  HTTP_STATUS,
  SOCKET_EVENTS,
  AUTH_COOKIE_NAME,
  JWT_PERSISTENT_EXPIRY,
  JWT_SESSION_EXPIRY,
  AUTH_COOKIE_MAX_AGE_MS,
  FRONTEND_URL,
  SERVER_PORT,
  ROLES,
  MENTORSHIP_STATUS,
  APPLICATION_STATUS,
  INTERVIEW_RESPONSE,
  JOB_TYPE,
  JOB_STATUS,
  EXPERIENCE_LEVEL,
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
  MAX_CHAT_FILE_SIZE,
  UPLOAD_DIRS,
  DEPARTMENT_LABELS,
  PASSWORD_MIN_LENGTH,
  FULL_NAME_MAX_LENGTH,
};
