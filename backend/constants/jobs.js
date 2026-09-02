const APPLICATION_STATUS = {
  APPLIED: "applied",
  IN_REVIEW: "in_review",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

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

const JOB_FILTER = {
  ALL_TYPES: "All Jobs",
};

const JOB_SORT = {
  NEWEST: "newest",
  OLDEST: "oldest",
  DEADLINE: "deadline",
};

const JOB_STATS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const JOB_REQUIREMENTS_MAX_COUNT = 20;

const INTERVIEW_LIMITS = {
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 240,
  DEFAULT_DURATION_MINUTES: 30,
  INSTRUCTIONS_MAX_LENGTH: 1000,
};

module.exports = {
  APPLICATION_STATUS,
  JOB_TYPE,
  JOB_STATUS,
  INTERVIEW_RESPONSE,
  EXPERIENCE_LEVEL,
  JOB_FILTER,
  JOB_SORT,
  JOB_STATS_WINDOW_MS,
  JOB_REQUIREMENTS_MAX_COUNT,
  INTERVIEW_LIMITS,
};
