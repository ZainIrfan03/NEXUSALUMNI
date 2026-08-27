import { Video, X } from "lucide-react";
import { INTERVIEW_DURATION_OPTIONS } from "../../../../consts/jobConstants";

export default function InterviewModal({
  error,
  form,
  jobTitle,
  onClose,
  onFieldChange,
  onSubmit,
  scheduling,
  target,
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <Video size={18} /> Schedule Interview
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {target.fullName} · {jobTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule form"
          >
            <X size={19} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 grid sm:grid-cols-2 gap-4">
          {error && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Date and time
            <input
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(event) =>
                onFieldChange("scheduledAt", event.target.value)
              }
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Timezone
            <input
              type="text"
              required
              value={form.timezone}
              onChange={(event) =>
                onFieldChange("timezone", event.target.value)
              }
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Duration
            <select
              value={form.durationMinutes}
              onChange={(event) =>
                onFieldChange("durationMinutes", event.target.value)
              }
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal"
            >
              {INTERVIEW_DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Google Meet or Zoom link
            <input
              type="url"
              required
              placeholder="https://meet.google.com/..."
              value={form.meetingUrl}
              onChange={(event) =>
                onFieldChange("meetingUrl", event.target.value)
              }
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Instructions (optional)
            <textarea
              rows={3}
              maxLength={1000}
              value={form.instructions}
              onChange={(event) =>
                onFieldChange("instructions", event.target.value)
              }
              placeholder="Please join 5 minutes early..."
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal resize-none outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600"
          >
            Cancel
          </button>
          <button
            disabled={scheduling}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
          >
            {scheduling ? "Scheduling..." : "Schedule & Notify Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
