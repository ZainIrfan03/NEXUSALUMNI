import { APPLICATION_STATUS, JOB_TYPES } from "./appConstants";

export const JOB_TYPE_OPTIONS = Object.values(JOB_TYPES);
export const JOB_TYPE_TABS = ["All Jobs", ...JOB_TYPE_OPTIONS];

export const JOB_DEPARTMENT_OPTIONS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Other",
];

export const JOB_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "deadline", label: "Deadline soon" },
];

export const APPLICATION_STATUS_META = {
  [APPLICATION_STATUS.APPLIED]: { label: "Applied", tone: "neutral" },
  [APPLICATION_STATUS.IN_REVIEW]: { label: "In Review", tone: "warning" },
  [APPLICATION_STATUS.INTERVIEW]: { label: "Interview", tone: "info" },
  [APPLICATION_STATUS.ACCEPTED]: { label: "Accepted", tone: "success" },
  [APPLICATION_STATUS.REJECTED]: { label: "Rejected", tone: "danger" },
};

export const APPLICANT_STATUS_OPTIONS = [
  { value: APPLICATION_STATUS.APPLIED, label: "Applied" },
  { value: APPLICATION_STATUS.IN_REVIEW, label: "Move to Review" },
  { value: APPLICATION_STATUS.INTERVIEW, label: "Schedule Interview" },
  { value: APPLICATION_STATUS.ACCEPTED, label: "Accept" },
  { value: APPLICATION_STATUS.REJECTED, label: "Reject" },
];

export const JOB_STATUS_TONES = {
  Active: "info",
  Closed: "neutral",
  Draft: "warning",
};

export const INTERVIEW_DURATION_OPTIONS = [30, 45, 60, 90];
