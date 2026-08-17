import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

/**
 * Student Jobs API — covers:
 *   GET  /jobs?type=              (job board, filterable by tab)
 *   GET  /jobs/my-applications    (sidebar tracking counters)
 *   POST /jobs/:id/apply
 *   POST /jobs/:id/save
 *
 * Cache tags do the work that Jobs.jsx used to do by hand:
 *   - after applying, both the job (its `hasApplied` flag) and the
 *     tracking stats refetch automatically — no manual setState patching
 *     of two different pieces of state to keep them in sync.
 *   - the old "if the apply call 400s, treat it as already-applied
 *     anyway" special case goes away too: invalidatesTags runs whether
 *     the mutation succeeded or failed, so either way we just refetch
 *     and show whatever the backend now says is true.
 */
export const studentJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (type) => ({ url: "/jobs", params: { type } }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((job) => ({ type: TAGS.JOBS, id: job._id })),
              { type: TAGS.JOBS, id: "LIST" },
            ]
          : [{ type: TAGS.JOBS, id: "LIST" }],
    }),

    getMyApplicationStats: builder.query({
      query: () => "/jobs/my-applications",
      providesTags: [TAGS.MY_APPLICATIONS],
    }),

    applyToJob: builder.mutation({
      query: (jobId) => ({
        url: `/jobs/${jobId}/apply`,
        method: "POST",
      }),
      // Runs on success AND on failure (e.g. a 400 for "already applied")
      // — either way the truth now lives on the backend, so just refetch.
      invalidatesTags: (result, error, jobId) => [
        { type: TAGS.JOBS, id: jobId },
        TAGS.MY_APPLICATIONS,
      ],
    }),

    toggleSaveJob: builder.mutation({
      query: (jobId) => ({
        url: `/jobs/${jobId}/save`,
        method: "POST",
      }),
      invalidatesTags: (result, error, jobId) => [{ type: TAGS.JOBS, id: jobId }],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetMyApplicationStatsQuery,
  useApplyToJobMutation,
  useToggleSaveJobMutation,
} = studentJobsApi;
