import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

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
              ...result.jobs.map((job) => ({ type: TAGS.JOBS, id: job._id })),
              { type: TAGS.JOBS, id: "ALUMNI_LIST" },
            ]
          : [{ type: TAGS.JOBS, id: "ALUMNI_LIST" }],
    }),

    getJobApplicants: builder.query({
      query: (jobId) => `/alumni/jobs/${jobId}/applicants`,
      providesTags: (result, error, jobId) => [
        { type: TAGS.JOB_APPLICANTS, id: jobId },
      ],
    }),

    deleteMyJob: builder.mutation({
      query: (jobId) => ({
        url: `/alumni/jobs/${jobId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: TAGS.JOBS, id: jobId },
        { type: TAGS.JOBS, id: "ALUMNI_LIST" },
        { type: TAGS.JOBS, id: "LIST" },

        TAGS.ALUMNI_DASHBOARD,
      ],
    }),

    updateApplicationStatus: builder.mutation({
      query: ({ applicationId, status }) => ({
        url: `/alumni/jobs/applications/${applicationId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: TAGS.JOB_APPLICANTS, id: jobId },
        { type: TAGS.JOBS, id: jobId },
        { type: TAGS.JOBS, id: "ALUMNI_LIST" },
      ],
    }),

    scheduleInterview: builder.mutation({
      query: ({ applicationId, ...interview }) => ({
        url: `/alumni/jobs/applications/${applicationId}/interview`,
        method: "PATCH",
        body: interview,
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: TAGS.JOB_APPLICANTS, id: jobId },
        { type: TAGS.JOBS, id: jobId },
        { type: TAGS.JOBS, id: "ALUMNI_LIST" },
      ],
    }),

    createJob: builder.mutation({
      query: (jobData) => ({
        url: "/jobs",
        method: "POST",
        body: jobData,
      }),
      invalidatesTags: [
        { type: TAGS.JOBS, id: "ALUMNI_LIST" },
        { type: TAGS.JOBS, id: "LIST" },

        TAGS.ALUMNI_DASHBOARD,
      ],
    }),
  }),
});

export const {
  useGetMyJobsQuery,
  useGetJobApplicantsQuery,
  useDeleteMyJobMutation,
  useUpdateApplicationStatusMutation,
  useScheduleInterviewMutation,
  useCreateJobMutation,
} = alumniJobsApi;
