import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetMyJobsQuery,
  useGetJobApplicantsQuery,
  useDeleteMyJobMutation,
  useUpdateApplicationStatusMutation,
  useScheduleInterviewMutation,
} from "../../../store/api/alumniJobsApi";
import {
  APPLICATION_STATUS,
  ROUTES,
  SOCKET_EVENTS,
  UI_LIMITS,
} from "../../../consts/appConstants";
import {
  APPLICANT_STATUS_OPTIONS,
  APPLICATION_STATUS_META,
  INTERVIEW_DURATION_OPTIONS,
  JOB_STATUS_TONES,
} from "../../../consts/jobConstants";
import { connectSocket } from "../../../utils/socket";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import StatusBadge from "../../../components/common/StatusBadge";
import DashboardStatCard from "../../../components/common/DashboardStatCard";
import UserAvatar from "../../../components/common/UserAvatar";

import {
  Plus,
  Briefcase,
  Users,
  TrendingUp,
  Trash2,
  Lightbulb,
  Sparkles,
  X,
  Mail,
  FileText,
  CalendarDays,
  Video,
} from "lucide-react";

const emptyInterviewForm = () => ({
  scheduledAt: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi",
  durationMinutes: 30,
  meetingUrl: "",
  instructions: "",
});

const toLocalDateTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

function AvatarStack({ applicants = [], count }) {
  const shown = applicants.slice(0, UI_LIMITS.AVATAR_STACK_SIZE);
  const extra = count - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((applicant, index) => (
        <UserAvatar
          key={applicant._id || index}
          name={applicant.fullName || "Applicant"}
          src={fileUrl(applicant.avatarUrl)}
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

export default function AlumniJobs() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState("");

  const {
    data: jobsData,
    isLoading: loading,
    error: jobsQueryError,
  } = useGetMyJobsQuery({ page, pageSize: UI_LIMITS.JOBS_PAGE_SIZE });

  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.totalCount || 0;
  const stats = jobsData?.stats || {
    totalPostings: 0,
    newThisWeek: 0,
    totalApplicants: 0,
    unreadApplicants: 0,
    fillRate: 0,
  };

  const [applicantsJobId, setApplicantsJobId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [scheduleError, setScheduleError] = useState("");

  const {
    data: applicantsData,
    isLoading: loadingApplicants,
    error: applicantsQueryError,
    refetch: refetchApplicants,
  } = useGetJobApplicantsQuery(applicantsJobId, { skip: !applicantsJobId });

  const applicants = applicantsData?.applicants || [];
  const applicantsJobTitle =
    applicantsData?.job?.title ??
    jobs.find((job) => job._id === applicantsJobId)?.title;

  const [deleteMyJob] = useDeleteMyJobMutation();
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();
  const [scheduleInterview, { isLoading: schedulingInterview }] =
    useScheduleInterviewMutation();

  useEffect(() => {
    if (!applicantsJobId) return undefined;
    const socket = connectSocket();
    const handleResponse = ({ jobId }) => {
      if (String(jobId) === String(applicantsJobId)) refetchApplicants();
    };
    socket.on(SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED, handleResponse);
    return () =>
      socket.off(SOCKET_EVENTS.INTERVIEW_RESPONSE_UPDATED, handleResponse);
  }, [applicantsJobId, refetchApplicants]);

  const error =
    actionError ||
    (jobsQueryError && "Could not load your job postings.") ||
    (applicantsQueryError && "Could not load applicants.");

  const openApplicants = (job) => {
    setActionError("");
    setApplicantsJobId(job._id);
  };

  const closeApplicants = () => setApplicantsJobId(null);

  const openStudentProfile = (profileId) => {
    if (!profileId) return;
    closeApplicants();
    navigate(ROUTES.ALUMNI.directoryProfile(profileId));
  };

  const handleDelete = async (jobId) => {
    setActionError("");
    try {
      await deleteMyJob(jobId).unwrap();
    } catch (err) {
      setActionError(err.data?.message || "Could not delete this posting.");
    }
  };

  const handleStatusChange = async (applicant, status) => {
    if (status === APPLICATION_STATUS.INTERVIEW) {
      setScheduleError("");
      setInterviewTarget(applicant);
      setInterviewForm(
        applicant.interview
          ? {
              scheduledAt: toLocalDateTimeInput(
                applicant.interview.scheduledAt,
              ),
              timezone: applicant.interview.timezone,
              durationMinutes: applicant.interview.durationMinutes,
              meetingUrl: applicant.interview.meetingUrl,
              instructions: applicant.interview.instructions || "",
            }
          : emptyInterviewForm(),
      );
      return;
    }

    setActionError("");
    setUpdatingId(applicant.applicationId);
    try {
      await updateApplicationStatus({
        applicationId: applicant.applicationId,
        status,
        jobId: applicantsJobId,
      }).unwrap();
    } catch (err) {
      setActionError(err.data?.message || "Could not update this application.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleInterview = async (event) => {
    event.preventDefault();
    setScheduleError("");
    try {
      await scheduleInterview({
        applicationId: interviewTarget.applicationId,
        jobId: applicantsJobId,
        ...interviewForm,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        durationMinutes: Number(interviewForm.durationMinutes),
      }).unwrap();
      setInterviewTarget(null);
    } catch (err) {
      setScheduleError(
        err.data?.message || "Could not schedule the interview.",
      );
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / UI_LIMITS.JOBS_PAGE_SIZE),
  );
  const rangeStart =
    totalCount === 0 ? 0 : (page - 1) * UI_LIMITS.JOBS_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * UI_LIMITS.JOBS_PAGE_SIZE, totalCount);

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-500 mt-1">
            Manage your active recruitment and review incoming alumni
            applications.
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ALUMNI.NEW_JOB)}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <DashboardStatCard
          variant="jobs"
          icon={Briefcase}
          note={stats.newThisWeek ? `+${stats.newThisWeek} this week` : null}
          value={stats.totalPostings}
          label="Total Postings"
        />
        <DashboardStatCard
          variant="jobs"
          icon={Users}
          note={
            stats.unreadApplicants ? `${stats.unreadApplicants} unread` : null
          }
          value={stats.totalApplicants}
          label="Total Applicants"
        />
        <DashboardStatCard
          variant="jobs"
          icon={TrendingUp}
          value={`${stats.fillRate}%`}
          label="Fill Rate"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3">Job Title</th>
              <th className="px-5 py-3">Date Posted</th>
              <th className="px-5 py-3">Applicants</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-gray-400"
                >
                  <LoadingSpinner
                    label="Loading postings..."
                    className="py-0"
                  />
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No job postings yet." />
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isClosed = job.status === "Closed";
                return (
                  <tr key={job._id} className="border-t border-gray-100">
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
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {job.datePosted}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openApplicants(job)}
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
                          onClick={() => openApplicants(job)}
                          aria-label="View applicants"
                          className="hover:text-primary"
                          title="View applicants"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          aria-label="Delete posting"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing {rangeStart}-{rangeEnd} of {totalCount} postings
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              disabled={page === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from(
              { length: Math.min(totalPages, 3) },
              (_, index) => index + 1,
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${
                  page === pageNumber
                    ? "bg-dark text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() =>
                setPage((currentPage) => Math.min(totalPages, currentPage + 1))
              }
              disabled={page === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div className="bg-blue-50 rounded-xl p-5 flex gap-3">
          <Lightbulb size={20} className="text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">
              Boost Your Visibility
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Job posts shared directly with your alumni network see 40% higher
              quality applications on average.
            </p>
            <button className="text-sm font-medium text-primary hover:underline mt-2">
              Learn how to boost →
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-5 flex gap-3">
          <Sparkles size={20} className="text-gray-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">
              AI Job Description Tool
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Use our new AI assistant to draft a compelling job description
              based on your alumni requirements.
            </p>
            <button className="text-sm font-medium text-gray-700 hover:underline mt-2">
              Try AI Drafting →
            </button>
          </div>
        </div>
      </div>

      {applicantsJobId && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeApplicants}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-dark">Applicants</h2>
                <p className="text-sm text-gray-500">{applicantsJobTitle}</p>
              </div>
              <button
                onClick={closeApplicants}
                className="text-gray-400 hover:text-dark"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingApplicants ? (
                <LoadingSpinner
                  label="Loading applicants..."
                  className="py-10"
                />
              ) : applicants.length === 0 ? (
                <EmptyState message="No one has applied to this job yet." />
              ) : (
                <div className="flex flex-col gap-3">
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.applicationId}
                      role="link"
                      tabIndex={applicant.profileId ? 0 : -1}
                      onClick={() => openStudentProfile(applicant.profileId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openStudentProfile(applicant.profileId);
                        }
                      }}
                      title="Open student profile"
                      className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3 cursor-pointer hover:border-primary/30 hover:bg-blue-50/30 transition-colors"
                    >
                      <UserAvatar
                        name={applicant.fullName}
                        src={fileUrl(applicant.avatarUrl)}
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
                          {[applicant.department, applicant.session]
                            .filter(Boolean)
                            .join(" • ")}
                          {applicant.department || applicant.session
                            ? " • "
                            : ""}
                          Applied{" "}
                          {new Date(applicant.appliedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                        {applicant.resumeUrl && (
                          <Link
                            to={fileUrl(applicant.resumeUrl)}
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
                                {new Date(
                                  applicant.interview.scheduledAt,
                                ).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </p>
                              <p className="mt-1 capitalize">
                                Student response:{" "}
                                {applicant.interview.response.replaceAll(
                                  "_",
                                  " ",
                                )}
                              </p>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge
                          label={
                            APPLICATION_STATUS_META[applicant.status]?.label ||
                            applicant.status
                          }
                          tone={
                            APPLICATION_STATUS_META[applicant.status]?.tone ||
                            "neutral"
                          }
                        />
                        <select
                          value={applicant.status}
                          disabled={updatingId === applicant.applicationId}
                          onChange={(event) =>
                            handleStatusChange(applicant, event.target.value)
                          }
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {interviewTarget && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleScheduleInterview}
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-dark flex items-center gap-2">
                  <Video size={18} /> Schedule Interview
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {interviewTarget.fullName} · {applicantsJobTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInterviewTarget(null)}
                aria-label="Close schedule form"
              >
                <X size={19} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 grid sm:grid-cols-2 gap-4">
              {scheduleError && (
                <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {scheduleError}
                </p>
              )}
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Date and time
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduledAt}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      scheduledAt: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Timezone
                <input
                  type="text"
                  required
                  value={interviewForm.timezone}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      timezone: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Duration
                <select
                  value={interviewForm.durationMinutes}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      durationMinutes: event.target.value,
                    })
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
                  value={interviewForm.meetingUrl}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      meetingUrl: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal outline-none focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Instructions (optional)
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={interviewForm.instructions}
                  onChange={(event) =>
                    setInterviewForm({
                      ...interviewForm,
                      instructions: event.target.value,
                    })
                  }
                  placeholder="Please join 5 minutes early..."
                  className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 font-normal resize-none outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setInterviewTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                disabled={schedulingInterview}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {schedulingInterview
                  ? "Scheduling..."
                  : "Schedule & Notify Student"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
