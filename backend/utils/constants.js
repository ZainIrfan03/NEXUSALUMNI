// Central place for backend-wide constant values.
// Add more constants here as duplicates are found (see Word report).

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
};

const AUTH_COOKIE_NAME = "token";

// Must exactly match FRONTEND/src/consts/const.jsx -> ROLES
// (also used as the `enum` for models/User.js -> role)
const ROLES = {
  STUDENT: "student",
  ALUMNI: "alumni",
  FACULTY: "faculty",
  ADMIN: "admin",
};

// Must exactly match FRONTEND/src/consts/const.jsx -> MENTORSHIP_STATUS
// (also used as the `enum` for models/MentorshipRequest.js -> status)
const MENTORSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  COMPLETED: "completed",
};

// Must exactly match FRONTEND/src/consts/const.jsx -> APPLICATION_STATUS
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

// File upload size limits — middleware/uploadMiddleware.js
const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Must exactly match FRONTEND/src/consts/const.jsx -> PASSWORD_MIN_LENGTH / FULL_NAME_MAX_LENGTH
// (Register.jsx enforces these client-side; validators/authValidators.js
// enforces them again server-side since a client check is bypassable.)
const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MAX_LENGTH = 15;

module.exports = {
  HTTP_STATUS,
  SOCKET_EVENTS,
  AUTH_COOKIE_NAME,
  ROLES,
  MENTORSHIP_STATUS,
  APPLICATION_STATUS,
  JOB_TYPE,
  JOB_STATUS,
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
  MAX_CHAT_FILE_SIZE,
  PASSWORD_MIN_LENGTH,
  FULL_NAME_MAX_LENGTH,
};