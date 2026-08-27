import { Trash2, Users } from "lucide-react";
import StatusBadge from "../../../../components/common/StatusBadge";
import UserAvatar from "../../../../components/common/UserAvatar";
import { UI_LIMITS } from "../../../../consts/appConstants";
import { JOB_STATUS_TONES } from "../../../../consts/jobConstants";
import { getImageUrl } from "../../../../utils/getImageUrl";

function AvatarStack({ applicants = [], count }) {
  const shown = applicants.slice(0, UI_LIMITS.AVATAR_STACK_SIZE);
  const extra = count - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((applicant, index) => (
        <UserAvatar
          key={applicant._id || index}
          name={applicant.fullName || "Applicant"}
          src={getImageUrl(applicant.avatarUrl)}
          className="h-8 w-8"
          imageClassName="border-2 border-white text-[10px]"
        />
      ))}
      {extra > 0 && (
        <span className="h-8 w-8 rounded-full bg-dark text-white text-xs font-semibold flex items-center justify-center border-2 border-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

export default function JobCard({ job, onDelete, onOpenApplicants }) {
  const isClosed = job.status === "Closed";

  return (
    <tr className="border-t border-gray-100">
      <td className="px-5 py-4">
        <p
          className={`font-semibold ${isClosed ? "text-gray-400" : "text-primary"}`}
        >
          {job.title}
        </p>
        <p
          className={`text-sm ${isClosed ? "text-gray-300" : "text-gray-500"}`}
        >
          {job.department} • {job.location}
        </p>
      </td>
      <td className="px-5 py-4 text-sm text-gray-500">{job.datePosted}</td>
      <td className="px-5 py-4">
        <button
          type="button"
          onClick={() => onOpenApplicants(job)}
          disabled={job.applicantCount === 0}
          className="flex items-center gap-3 disabled:cursor-default"
        >
          {job.applicantCount > 1 ? (
            <>
              <AvatarStack
                applicants={job.applicants}
                count={job.applicantCount}
              />
              <span className="text-sm text-gray-700 hover:text-primary hover:underline">
                {job.applicantCount} Applicants
              </span>
            </>
          ) : (
            <span
              className={`text-sm ${
                job.applicantCount === 1
                  ? "text-gray-700 hover:text-primary hover:underline"
                  : "text-gray-400"
              }`}
            >
              {job.applicantCount} Applicant
              {job.applicantCount === 1 ? "" : "s"}
            </span>
          )}
        </button>
      </td>
      <td className="px-5 py-4">
        <StatusBadge
          label={job.status}
          tone={JOB_STATUS_TONES[job.status] || "neutral"}
        />
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-3 text-gray-400">
          <button
            type="button"
            onClick={() => onOpenApplicants(job)}
            aria-label="View applicants"
            className="hover:text-primary"
            title="View applicants"
          >
            <Users size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(job._id)}
            aria-label="Delete posting"
            className="hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
