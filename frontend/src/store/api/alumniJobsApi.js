import { baseApi } from "./baseApi";

/**
 * Alumni Jobs API — covers:
 *   GET    /alumni/jobs?page=&pageSize=              (postings table + stats)
 *   DELETE /alumni/jobs/:id
 *   GET    /alumni/jobs/:id/applicants                (applicants modal)
 *   PATCH  /alumni/jobs/applications/:applicationId/status
 *   POST   /jobs                                       (create — used by AlumniJobNew.jsx)
 *
 * Tag id scheme: the alumni's own postings list uses id "ALUMNI_LIST" (not
 * "LIST") to keep it separate from studentJobsApi's public board cache —
 * they're different endpoints with different shapes, so invalidating one
 * shouldn't force-refetch the other. createJob and deleteMyJob invalidate
 * BOTH lists on purpose though: posting or removing a job should also
 * refresh the public /jobs board students see, not just this alumni's table.
 */
export const alumniJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyJobs: builder.query({
      query: ({ page, pageSize }) => ({
        url: "/alumni/jobs",
        params: { page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.jobs.map((job) => ({ type: "Jobs", id: job._id })),
              { type: "Jobs", id: "ALUMNI_LIST" },
            ]
          : [{ type: "Jobs", id: "ALUMNI_LIST" }],
    }),

    getJobApplicants: builder.query({
      query: (jobId) => `/alumni/jobs/${jobId}/applicants`,
      providesTags: (result, error, jobId) => [{ type: "JobApplicants", id: jobId }],
    }),

    deleteMyJob: builder.mutation({
      query: (jobId) => ({
        url: `/alumni/jobs/${jobId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: "Jobs", id: jobId },
        { type: "Jobs", id: "ALUMNI_LIST" },
        { type: "Jobs", id: "LIST" }, // deleting a posting should drop it off the student board too
      ],
    }),

    // jobId is passed alongside applicationId/status purely so we know which
    // postings-table row + applicants-modal cache to invalidate — the
    // backend endpoint itself only needs applicationId and status.
    updateApplicationStatus: builder.mutation({
      query: ({ applicationId, status }) => ({
        url: `/alumni/jobs/applications/${applicationId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: "JobApplicants", id: jobId },
        { type: "Jobs", id: jobId },
        { type: "Jobs", id: "ALUMNI_LIST" }, // unreadApplicants stat depends on status
      ],
    }),

    createJob: builder.mutation({
      query: (jobData) => ({
        url: "/jobs",
        method: "POST",
        body: jobData,
      }),
      invalidatesTags: [
        { type: "Jobs", id: "ALUMNI_LIST" },
        { type: "Jobs", id: "LIST" }, // new posting should show up on the student board immediately
      ],
    }),
  }),
});

export const {
  useGetMyJobsQuery,
  useGetJobApplicantsQuery,
  useDeleteMyJobMutation,
  useUpdateApplicationStatusMutation,
  useCreateJobMutation,
} = alumniJobsApi;