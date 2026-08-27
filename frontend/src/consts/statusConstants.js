import { MENTORSHIP_STATUS } from "./appConstants";

export const MENTORSHIP_STATUS_TONES = {
  [MENTORSHIP_STATUS.PENDING]: "warning",
  [MENTORSHIP_STATUS.ACCEPTED]: "success",
  [MENTORSHIP_STATUS.COMPLETED]: "info",
  [MENTORSHIP_STATUS.DECLINED]: "danger",
};

export const MENTEE_PROGRESS_STYLES = {
  "On Track": "bg-green-500",
  Idle: "bg-gray-400",
  "At Risk": "bg-red-500",
};
