import { CalendarDays, FileText, Mail, X } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import StatusBadge from "../../../../components/common/StatusBadge";
import UserAvatar from "../../../../components/common/UserAvatar";
import { APPLICATION_STATUS } from "../../../../consts/appConstants";
import {
  APPLICANT_STATUS_OPTIONS,
  APPLICATION_STATUS_META,
} from "../../../../consts/jobConstants";
import { getImageUrl } from "../../../../utils/getImageUrl";

function ApplicantCard({
  applicant,
  onOpenProfile,
  onStatusChange,
  updating,
}) {
  const openProfileFromKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenProfile(applicant.profileId);
    }
  };

  return (
    <div
      role="link"
      tabIndex={applicant.profileId ? 0 : -1}
      onClick={() => onOpenProfile(applicant.profileId)}
      onKeyDown={openProfileFromKeyboard}
      title="Open student profile"
      className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:border-primary/30 hover:bg-blue-50/30 transition-colors"
    >
      <UserAvatar
        name={applicant.fullName}
        src={getImageUrl(applicant.avatarUrl)}
        className="h-11 w-11"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dark truncate">
          {applicant.fullName}
        </p>
        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
          <Mail size={11} /> {applicant.email}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {[applicant.department, applicant.session].filter(Boolean).join(" • ")}
          {applicant.department || applicant.session ? " • " : ""}
          Applied{" "}
          {new Date(applicant.appliedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        {applicant.resumeUrl && (
          <Link
            to={getImageUrl(applicant.resumeUrl)}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-1 hover:underline"
          >
            <FileText size={11} /> View submitted resume
          </Link>
        )}
        {applicant.interview &&
          applicant.status === APPLICATION_STATUS.INTERVIEW && (
            <div className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-2.5 py-2">
              <p className="font-medium flex items-center gap-1">
                <CalendarDays size={12} />
                {new Date(applicant.interview.scheduledAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-1 capitalize">
                Student response:{" "}
                {applicant.interview.response.replaceAll("_", " ")}
              </p>
            </div>
          )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge
          label={
            APPLICATION_STATUS_META[applicant.status]?.label || applicant.status
          }
          tone={APPLICATION_STATUS_META[applicant.status]?.tone || "neutral"}
        />
        <select
          value={applicant.status}
          disabled={updating}
          onChange={(event) => onStatusChange(applicant, event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 disabled:opacity-50"
        >
          {APPLICANT_STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function ApplicantList({
  applicants,
  jobTitle,
  loading,
  onClose,
  onOpenProfile,
  onStatusChange,
  updatingId,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-dark">Applicants</h2>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close applicants"
            className="text-gray-400 hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <LoadingSpinner label="Loading applicants..." className="py-10" />
          ) : applicants.length === 0 ? (
            <EmptyState message="No one has applied to this job yet." />
          ) : (
            <div className="flex flex-col gap-3">
              {applicants.map((applicant) => (
                <ApplicantCard
                  key={applicant.applicationId}
                  applicant={applicant}
                  onOpenProfile={onOpenProfile}
                  onStatusChange={onStatusChange}
                  updating={updatingId === applicant.applicationId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
