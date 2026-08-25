export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
  INTERVIEW_SCHEDULED: "interviewScheduled",
  INTERVIEW_RESPONSE_UPDATED: "interviewResponseUpdated",
};

export const ROLES = {
  STUDENT: "student",
  ALUMNI: "alumni",
  FACULTY: "faculty",
  ADMIN: "admin",
};

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  SUCCESS_STORIES: "/success-stories",
  LOGIN: "/login",
  REGISTER: "/register",
  STUDENT: {
    DASHBOARD: "/dashboard/student",
    PROFILE: "/dashboard/student/profile",
    EDIT_PROFILE: "/dashboard/student/profile/edit",
    DIRECTORY: "/dashboard/student/directory",
    DIRECTORY_PROFILE: "/dashboard/student/directory/:id",
    directoryProfile: (id) => `/dashboard/student/directory/${id}`,
    MENTORSHIP: "/dashboard/student/mentorship",
    JOBS: "/dashboard/student/jobs",
    MESSAGES: "/dashboard/student/messages",
  },
  ALUMNI: {
    DASHBOARD: "/dashboard/alumni",
    PROFILE: "/dashboard/alumni/profile",
    EDIT_PROFILE: "/dashboard/alumni/profile/edit",
    DIRECTORY: "/dashboard/alumni/directory",
    DIRECTORY_PROFILE: "/dashboard/alumni/directory/:id",
    directoryProfile: (id) => `/dashboard/alumni/directory/${id}`,
    MENTORSHIP: "/dashboard/alumni/mentorship",
    JOBS: "/dashboard/alumni/jobs",
    NEW_JOB: "/dashboard/alumni/jobs/new",
    MESSAGES: "/dashboard/alumni/messages",
  },
  FACULTY: {
    DASHBOARD: "/dashboard/faculty",
    ENGAGEMENT: "/dashboard/faculty/engagement",
    EVENTS: "/dashboard/faculty/events",
    ANNOUNCEMENTS: "/dashboard/faculty/announcements",
  },
  ADMIN: {
    DASHBOARD: "/dashboard/admin",
    USERS: "/dashboard/admin/users",
    JOBS: "/dashboard/admin/jobs",
    EVENTS: "/dashboard/admin/events",
    REPORTS: "/dashboard/admin/reports",
  },
};

export const ROLE_HOME_ROUTES = {
  [ROLES.STUDENT]: ROUTES.STUDENT.DASHBOARD,
  [ROLES.ALUMNI]: ROUTES.ALUMNI.DASHBOARD,
  [ROLES.FACULTY]: ROUTES.FACULTY.DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN.DASHBOARD,
};

export const JOB_TYPES = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

export const EXPERIENCE_LEVELS = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior Level",
};

export const UI_LIMITS = {
  FEATURED_ALUMNI: 4,
  SUCCESS_STORIES_PAGE_SIZE: 6,
  SUCCESS_STORIES_HERO_COUNT: 2,
  DIRECTORY_PAGE_SIZE: 6,
  JOBS_PAGE_SIZE: 4,
  MENTORSHIP_REQUEST_PAGE_SIZE: 4,
  AVATAR_STACK_SIZE: 2,
  DASHBOARD_PREVIEW_COUNT: 2,
  SEARCH_DEBOUNCE_MS: 400,
};

export const MENTORSHIP_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  COMPLETED: "completed",
};

export const APPLICATION_STATUS = {
  APPLIED: "applied",
  IN_REVIEW: "in_review",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

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
  UNREAD_MESSAGES: "UnreadMessages",
};

export const INTERVIEW_RESPONSE = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  RESCHEDULE_REQUESTED: "reschedule_requested",
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const FULL_NAME_MAX_LENGTH = 15;

export const TYPING_TIMEOUT_MS = 2000;

export const REDIRECT_DELAY_MS = 800;
