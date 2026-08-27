import { Lightbulb, Plus, Sparkles } from "lucide-react";
import EmptyState from "../../../../components/common/EmptyState";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import ApplicantList from "./ApplicantList";
import InterviewModal from "./InterviewModal";
import JobCard from "./JobCard";
import JobStats from "./JobStats";
import useAlumniJobs from "./useAlumniJobs";

function Pagination({
  page,
  rangeEnd,
  rangeStart,
  setPage,
  totalCount,
  totalPages,
}) {
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 3) },
    (_, index) => index + 1,
  );

  return (
    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing {rangeStart}-{rangeEnd} of {totalCount} postings
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
        >
          ‹
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            type="button"
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
          type="button"
          onClick={() =>
            setPage((currentPage) => Math.min(totalPages, currentPage + 1))
          }
          disabled={page === totalPages}
          aria-label="Next page"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 disabled:opacity-40"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function JobsTable({ model }) {
  return (
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
          {model.loading ? (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                <LoadingSpinner label="Loading postings..." className="py-0" />
              </td>
            </tr>
          ) : model.jobs.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <EmptyState message="No job postings yet." />
              </td>
            </tr>
          ) : (
            model.jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onDelete={model.handleDelete}
                onOpenApplicants={model.openApplicants}
              />
            ))
          )}
        </tbody>
      </table>

      <Pagination
        page={model.page}
        rangeEnd={model.rangeEnd}
        rangeStart={model.rangeStart}
        setPage={model.setPage}
        totalCount={model.totalCount}
        totalPages={model.totalPages}
      />
    </div>
  );
}

function RecruitmentTips() {
  return (
    <div className="grid md:grid-cols-2 gap-5 mt-6">
      <div className="bg-blue-50 rounded-xl p-5 flex gap-3">
        <Lightbulb size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">Boost Your Visibility</h3>
          <p className="text-sm text-gray-600 mt-1">
            Job posts shared directly with your alumni network see 40% higher
            quality applications on average.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline mt-2"
          >
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
          <button
            type="button"
            className="text-sm font-medium text-gray-700 hover:underline mt-2"
          >
            Try AI Drafting →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlumniJobsPage() {
  const model = useAlumniJobs();

  return (
    <div>
      {model.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-5">
          {model.error}
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
          type="button"
          onClick={model.openNewJob}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90"
        >
          <Plus size={16} /> Post New Job
        </button>
      </div>

      <JobStats stats={model.stats} />
      <JobsTable model={model} />
      <RecruitmentTips />

      {model.applicantsJobId && (
        <ApplicantList
          applicants={model.applicants}
          jobTitle={model.applicantsJobTitle}
          loading={model.loadingApplicants}
          onClose={model.closeApplicants}
          onOpenProfile={model.openStudentProfile}
          onStatusChange={model.handleStatusChange}
          updatingId={model.updatingId}
        />
      )}

      {model.interviewTarget && (
        <InterviewModal
          error={model.scheduleError}
          form={model.interviewForm}
          jobTitle={model.applicantsJobTitle}
          onClose={model.closeInterview}
          onFieldChange={model.updateInterviewField}
          onSubmit={model.handleScheduleInterview}
          scheduling={model.schedulingInterview}
          target={model.interviewTarget}
        />
      )}
    </div>
  );
}
