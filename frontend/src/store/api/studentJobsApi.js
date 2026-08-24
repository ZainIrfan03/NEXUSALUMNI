import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const studentJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (params) => ({ url: "/jobs", params }),
      providesTags: (result) =>
        result?.jobs
          ? [
              ...result.jobs.map((job) => ({ type: TAGS.JOBS, id: job._id })),
              { type: TAGS.JOBS, id: "LIST" },
            ]
          : [{ type: TAGS.JOBS, id: "LIST" }],
    }),

    getMyApplications: builder.query({
      query: () => "/jobs/my-applications",
      providesTags: [TAGS.MY_APPLICATIONS],
    }),

    applyToJob: builder.mutation({
      query: (jobId) => ({
        url: `/jobs/${jobId}/apply`,
        method: "POST",
      }),

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
      invalidatesTags: (result, error, jobId) => [
        { type: TAGS.JOBS, id: jobId },

        TAGS.STUDENT_DASHBOARD,
      ],
    }),

    respondToInterview: builder.mutation({
      query: ({ applicationId, response }) => ({
        url: `/jobs/applications/${applicationId}/interview-response`,
        method: "PATCH",
        body: { response },
      }),
      invalidatesTags: [TAGS.MY_APPLICATIONS],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetMyApplicationsQuery,
  useApplyToJobMutation,
  useToggleSaveJobMutation,
  useRespondToInterviewMutation,
} = studentJobsApi;
