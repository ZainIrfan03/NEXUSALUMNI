import React from "react";

/**
 * Shared status pill used for job status, applicant pipeline stage,
 * mentorship request status, "Applied"/"New" tags, etc.
 * Each page used to define its own color map + repeat the same
 * `<span className="text-xs font-medium rounded-full px-3 py-1.5 ...">`
 * markup — this centralizes both the markup and the color tones.
 *
 * `tone` picks the color scheme; pages keep their own status→tone
 * mapping (e.g. { pending: "warning", accepted: "success" }) since the
 * status vocabulary differs per feature (jobs vs mentorship vs applicants).
 *
 * Usage:
 *   <StatusBadge label="Accepted" tone="success" />
 *   <StatusBadge label="In Review" tone="warning" icon={Clock} />
 */
const TONE_STYLES = {
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-blue-50 text-primary",
  neutral: "bg-gray-100 text-gray-500",
  danger: "bg-red-50 text-red-500",
};

export default function StatusBadge({ label, tone = "neutral", icon: Icon, className = "" }) {
  const toneClasses = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-3 py-1.5 ${toneClasses} ${className}`}
    >
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}