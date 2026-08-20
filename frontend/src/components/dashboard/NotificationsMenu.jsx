import { CalendarDays, Mail } from "lucide-react";

export default function NotificationsMenu({
  interviewNotice,
  interviewNotifications,
  liveNoticeAlreadyLoaded,
  notificationCount,
  onOpenInterviews,
  onOpenMessages,
  unreadMessageCount,
}) {
  return (
    <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl z-50">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-dark">Notifications</h2>
        {notificationCount > 0 && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
            {notificationCount} new
          </span>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto py-1">
        {interviewNotice && !liveNoticeAlreadyLoaded && (
          <button
            onClick={onOpenInterviews}
            className="w-full flex gap-3 px-4 py-3 text-left hover:bg-blue-50"
          >
            <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-primary">
              <CalendarDays size={16} />
            </span>
            <span>
              <strong className="block text-sm text-dark">Interview scheduled</strong>
              <span className="block text-xs text-gray-500 mt-0.5">
                {interviewNotice.jobTitle}
              </span>
            </span>
          </button>
        )}

        {interviewNotifications.map((application) => (
          <button
            key={application._id}
            onClick={onOpenInterviews}
            className="w-full flex gap-3 px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-50 last:border-0"
          >
            <span className="mt-0.5 rounded-lg bg-blue-50 p-2 text-primary">
              <CalendarDays size={16} />
            </span>
            <span className="min-w-0">
              <strong className="block text-sm text-dark truncate">
                Interview: {application.job.title}
              </strong>
              <span className="block text-xs text-gray-500 mt-0.5">
                {new Date(application.interview.scheduledAt).toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <span className="block text-[11px] capitalize text-primary mt-1">
                {application.interview.response.replaceAll("_", " ")}
              </span>
            </span>
          </button>
        ))}

        {unreadMessageCount > 0 && (
          <button
            onClick={onOpenMessages}
            className="w-full flex gap-3 px-4 py-3 text-left hover:bg-gray-50"
          >
            <span className="mt-0.5 rounded-lg bg-gray-100 p-2 text-gray-600">
              <Mail size={16} />
            </span>
            <span>
              <strong className="block text-sm text-dark">Unread messages</strong>
              <span className="block text-xs text-gray-500 mt-0.5">
                You have {unreadMessageCount} unread message
                {unreadMessageCount === 1 ? "" : "s"}.
              </span>
            </span>
          </button>
        )}

        {!interviewNotice &&
          interviewNotifications.length === 0 &&
          unreadMessageCount === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              No notifications yet.
            </p>
          )}
      </div>
    </div>
  );
}
