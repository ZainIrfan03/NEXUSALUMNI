import { Link } from "react-router-dom";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import StatusBadge from "../../../components/common/StatusBadge";
import {
  APPLICATION_STATUS,
  EXPERIENCE_LEVELS,
  INTERVIEW_RESPONSE,
  ROUTES,
} from "../../../consts/appConstants";
import {
  APPLICATION_STATUS_META,
  JOB_DEPARTMENT_OPTIONS,
  JOB_SORT_OPTIONS,
  JOB_TYPE_TABS,
} from "../../../consts/jobConstants";
import {
  Bookmark,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  Send,
  SlidersHorizontal,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import useStudentJobs from "./Jobs/useStudentJobs";

export default function Jobs() {
  const {
    activeType, applications, applyingJobId, clearFilters, department, error,
    experienceLevel, handleApply, handleInterviewResponse, handleToggleSave,
    jobs, jobsData, loadingApplications, loadingJobs, location, navigate, page,
    renderTime, resetPage, respondingApplicationId, resumeRequired, savingJobId,
    searchInput, selectView, selectedJob, setActiveType, setDepartment,
    setExperienceLevel, setLocation, setPage, setSearchInput, setSelectedJobId,
    setShowFilters, setSort, showFilters, sort, stats, submitSearch, view,
  } = useStudentJobs();

  const tracking = [
    { label: "Applied", value: stats.applied || 0, icon: Send },
    { label: "In Review", value: stats.in_review || 0, icon: Eye },
    { label: "Interviews", value: stats.interview || 0, icon: MessageSquare },
    { label: "Accepted", value: stats.accepted || 0, icon: CheckCircle2 },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Job Opportunities</h1>
          <p className="text-gray-500 mt-1">
            Discover roles and track every application in one place.
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.STUDENT.EDIT_PROFILE)}
          className="inline-flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-dark hover:border-primary"
        >
          <UploadCloud size={16} /> Update Resume
        </button>
      </div>

      <div
        className="flex flex-wrap gap-2 mb-5"
        role="tablist"
        aria-label="Job sections"
      >
        {[
          ["browse", "Browse Jobs"],
          ["saved", "Saved Jobs"],
          ["applications", `My Applications (${stats.total || 0})`],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={view === key}
            onClick={() => selectView(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              view === key
                ? "bg-dark text-white"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          <span>{error}</span>
          {resumeRequired && (
            <button
              onClick={() => navigate(ROUTES.STUDENT.EDIT_PROFILE)}
              className="font-semibold underline"
            >
              Upload resume
            </button>
          )}
        </div>
      )}

      {view === "applications" ? (
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-dark">Application History</h2>
            <p className="text-sm text-gray-500">
              Your latest status appears here automatically.
            </p>
          </div>
          {loadingApplications ? (
            <LoadingSpinner label="Loading applications..." />
          ) : applications.length === 0 ? (
            <EmptyState message="You have not applied to any jobs yet." />
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((application) => (
                <article
                  key={application._id}
                  className="p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-dark">
                      {application.job.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {application.job.company} · {application.job.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied{" "}
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                    {application.interview &&
                      application.status === APPLICATION_STATUS.INTERVIEW && (
                        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                          <p className="font-semibold text-primary flex items-center gap-2">
                            <CalendarDays size={15} /> Interview scheduled
                          </p>
                          <p className="text-gray-700 mt-1">
                            {new Date(
                              application.interview.scheduledAt,
                            ).toLocaleString([], {
                              dateStyle: "full",
                              timeStyle: "short",
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {application.interview.durationMinutes} minutes ·{" "}
                            {application.interview.timezone}
                          </p>
                          {application.interview.instructions && (
                            <p className="text-xs text-gray-600 mt-2">
                              {application.interview.instructions}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Link
                              to={application.interview.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-primary text-white rounded-lg px-3 py-2 text-xs font-semibold"
                            >
                              <Video size={13} /> Join Interview
                            </Link>
                            {application.interview.response !==
                              INTERVIEW_RESPONSE.CONFIRMED && (
                              <button
                                disabled={
                                  respondingApplicationId === application._id
                                }
                                onClick={() =>
                                  handleInterviewResponse(
                                    application._id,
                                    INTERVIEW_RESPONSE.CONFIRMED,
                                  )
                                }
                                className="border border-green-200 text-green-700 bg-white rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50"
                              >
                                Confirm
                              </button>
                            )}
                            {application.interview.response !==
                              INTERVIEW_RESPONSE.RESCHEDULE_REQUESTED && (
                              <button
                                disabled={
                                  respondingApplicationId === application._id
                                }
                                onClick={() =>
                                  handleInterviewResponse(
                                    application._id,
                                    INTERVIEW_RESPONSE.RESCHEDULE_REQUESTED,
                                  )
                                }
                                className="border border-amber-200 text-amber-700 bg-white rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50"
                              >
                                Request Reschedule
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 capitalize">
                            Response:{" "}
                            {application.interview.response.replaceAll(
                              "_",
                              " ",
                            )}
                          </p>
                        </div>
                      )}
                  </div>
                  <StatusBadge
                    label={
                      APPLICATION_STATUS_META[application.status]?.label ||
                      application.status
                    }
                    tone={
                      APPLICATION_STATUS_META[application.status]?.tone ||
                      "neutral"
                    }
                  />
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="grid xl:grid-cols-[1fr_300px] gap-6">
          <div>
            <form onSubmit={submitSearch} className="flex gap-2 mb-4">
              <label className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <span className="sr-only">Search jobs</span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by title, company, or keyword"
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                className="bg-primary text-white rounded-xl px-5 text-sm font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="bg-white border border-gray-200 rounded-xl px-4 text-gray-600"
                aria-label="Toggle advanced filters"
              >
                <SlidersHorizontal size={18} />
              </button>
            </form>

            {showFilters && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white border border-gray-100 rounded-xl p-4 mb-4">
                <input
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    resetPage();
                  }}
                  placeholder="Location"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <select
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    resetPage();
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All departments</option>
                  {JOB_DEPARTMENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={experienceLevel}
                  onChange={(event) => {
                    setExperienceLevel(event.target.value);
                    resetPage();
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All experience levels</option>
                  {Object.values(EXPERIENCE_LEVELS).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    resetPage();
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  {JOB_SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={clearFilters}
                  type="button"
                  className="text-left text-sm font-medium text-primary"
                >
                  Clear all filters
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-5">
              {JOB_TYPE_TABS.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    resetPage();
                  }}
                  className={`text-sm font-medium px-3.5 py-2 rounded-full ${
                    activeType === type
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {loadingJobs ? (
              <LoadingSpinner label="Loading jobs..." />
            ) : jobs.length === 0 ? (
              <EmptyState
                message={
                  view === "saved"
                    ? "You have no saved jobs matching these filters."
                    : "No active jobs match these filters."
                }
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                {jobs.map((job) => {
                  const isNew =
                    renderTime - new Date(job.createdAt).getTime() <
                    3 * 24 * 60 * 60 * 1000;
                  return (
                    <article
                      key={job._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <span className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                          <Briefcase size={18} />
                        </span>
                        <div className="flex items-center gap-2">
                          {job.hasApplied ? (
                            <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 bg-green-50 text-green-600">
                              APPLIED
                            </span>
                          ) : isNew ? (
                            <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 bg-gray-100 text-gray-500">
                              NEW
                            </span>
                          ) : null}
                          <button
                            onClick={() => handleToggleSave(job._id)}
                            disabled={savingJobId === job._id}
                            aria-label={
                              job.hasSaved
                                ? "Remove from saved jobs"
                                : "Save job"
                            }
                          >
                            <Bookmark
                              size={18}
                              className={
                                job.hasSaved
                                  ? "fill-primary text-primary"
                                  : "text-gray-300"
                              }
                            />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJobId(job._id)}
                        className="text-left"
                      >
                        <h2 className="font-bold text-dark text-lg hover:text-primary">
                          {job.title}
                        </h2>
                      </button>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.company} · {job.location}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 my-4">
                        <span className="flex items-center gap-1">
                          <Briefcase size={13} /> {job.type}
                        </span>
                        <span>{job.experienceLevel}</span>
                        {job.payRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={13} /> {job.payRange}
                          </span>
                        )}
                      </div>
                      {job.deadline && (
                        <p className="text-xs text-gray-400 mb-4">
                          Apply by {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedJobId(job._id)}
                        className={`mt-auto w-full text-sm font-semibold py-2.5 rounded-xl ${job.hasApplied ? "bg-green-50 text-green-600" : "bg-dark text-white"}`}
                      >
                        {job.hasApplied ? "Applied" : "View & Apply"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            {(jobsData?.totalPages || 1) > 1 && (
              <nav
                className="flex items-center justify-center gap-3 mt-7"
                aria-label="Jobs pagination"
              >
                <button
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={page === 1}
                  className="h-9 w-9 bg-white rounded-lg disabled:opacity-40 flex items-center justify-center"
                >
                  <ChevronLeft size={17} />
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {jobsData.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((value) => Math.min(jobsData.totalPages, value + 1))
                  }
                  disabled={page === jobsData.totalPages}
                  className="h-9 w-9 bg-white rounded-lg disabled:opacity-40 flex items-center justify-center"
                >
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}
          </div>

          <aside className="bg-primary rounded-2xl p-5 h-fit">
            <h2 className="text-white font-semibold text-lg mb-4">
              Application Tracking
            </h2>
            <div className="space-y-2">
              {tracking.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3"
                >
                  <span className="flex items-center gap-2 text-sm text-white/90">
                    <Icon size={15} /> {label}
                  </span>
                  <strong className="text-white">{value}</strong>
                </div>
              ))}
            </div>
            {(stats.rejected || 0) > 0 && (
              <p className="text-xs text-white/60 mt-3">
                Rejected: {stats.rejected}
              </p>
            )}
          </aside>
        </div>
      )}

      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJobId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-title"
            className="bg-white rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 pt-6">
              <span className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                <Briefcase size={20} />
              </span>
              <button
                onClick={() => setSelectedJobId(null)}
                aria-label="Close job details"
                className="text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 pt-4 pb-5">
              <h2 id="job-title" className="text-xl font-bold text-dark">
                {selectedJob.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedJob.company}
                {selectedJob.postedBy?.fullName
                  ? ` · Posted by ${selectedJob.postedBy.fullName}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {selectedJob.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} /> {selectedJob.type}
                </span>
                <span>{selectedJob.experienceLevel}</span>
                {selectedJob.payRange && (
                  <span className="flex items-center gap-1">
                    <DollarSign size={14} /> {selectedJob.payRange}
                  </span>
                )}
                {selectedJob.deadline && (
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} /> Apply by{" "}
                    {new Date(selectedJob.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <section className="mt-5">
                <h3 className="text-sm font-semibold text-dark mb-2">
                  Job Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedJob.description || "No description provided."}
                </p>
              </section>
              {selectedJob.requirements?.length > 0 && (
                <section className="mt-5">
                  <h3 className="text-sm font-semibold text-dark mb-2">
                    Requirements
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    {selectedJob.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
            <div className="px-6 py-5 border-t border-gray-100">
              <p className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <FileText size={14} /> Your currently uploaded resume will be
                submitted.
              </p>
              <button
                onClick={() => handleApply(selectedJob._id)}
                disabled={
                  selectedJob.hasApplied || applyingJobId === selectedJob._id
                }
                className={`w-full text-sm font-semibold py-3 rounded-xl disabled:opacity-60 ${selectedJob.hasApplied ? "bg-green-50 text-green-600" : "bg-primary text-white"}`}
              >
                {selectedJob.hasApplied
                  ? "Application submitted"
                  : applyingJobId === selectedJob._id
                    ? "Submitting..."
                    : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
