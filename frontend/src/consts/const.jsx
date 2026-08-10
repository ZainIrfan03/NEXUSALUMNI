export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
 export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

 export const UI_AVATARS_BASE_URL = "https://ui-avatars.com/api"; 
 export const PRAVATAR_BASE_URL = "https://i.pravatar.cc/150";
 
// Must exactly match BACKEND/utils/constants.js -> SOCKET_EVENTS
export const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
};

// Must exactly match BACKEND/models/User.js -> role enum
export const ROLES = {
  STUDENT: "student",
  ALUMNI: "alumni",
  ADMIN: "admin",
};
 
// Must exactly match BACKEND/models/MentorshipRequest.js -> status enum
export const MENTORSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  COMPLETED: "completed",
};

// Must exactly match BACKEND/models/Application.js -> status enum
// (job application pipeline stage, alumni moves applicants through this)
export const APPLICATION_STATUS = {
  APPLIED: "applied",
  IN_REVIEW: "in_review",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// RTK Query cache tag names. Must exactly match the `tagTypes` array
// declared in store/api/baseApi.js — every providesTags/invalidatesTags
// across the *Api.js feature files should reference these instead of
// raw strings, so a typo becomes a build error instead of a silent
// cache-invalidation bug.
export const TAGS = {
  JOBS: "Jobs",
  MY_APPLICATIONS: "MyApplications",
  JOB_APPLICANTS: "JobApplicants",
  MENTORSHIP_REQUESTS: "MentorshipRequests",
  RECOMMENDED_MENTORS: "RecommendedMentors",
  STUDENT_DIRECTORY: "StudentDirectory",
  ALUMNI_DIRECTORY: "AlumniDirectory",
  STUDENT_PROFILE: "StudentProfile",
  ALUMNI_PROFILE: "AlumniProfile",
  STUDENT_DASHBOARD: "StudentDashboard",
  ALUMNI_DASHBOARD: "AlumniDashboard",
  CONVERSATIONS: "Conversations",
  MESSAGES: "Messages",
};

// Register.jsx form validation — was duplicated (email regex x2, min
// length x2, max length x3) inside the same file.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const FULL_NAME_MAX_LENGTH = 15;

export const LOCAL_STORAGE_USER_KEY = "user";