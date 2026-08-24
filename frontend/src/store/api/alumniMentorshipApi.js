import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const alumniMentorshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMentorshipOverview: builder.query({
      query: () => "/alumni/mentorship",
      providesTags: [TAGS.MENTORSHIP_REQUESTS],
    }),

    acceptMentorshipRequest: builder.mutation({
      query: (requestId) => ({
        url: `/alumni/mentorship/requests/${requestId}/accept`,
        method: "POST",
      }),
      invalidatesTags: [TAGS.MENTORSHIP_REQUESTS],
    }),

    rejectMentorshipRequest: builder.mutation({
      query: (requestId) => ({
        url: `/alumni/mentorship/requests/${requestId}/reject`,
        method: "POST",
      }),
      invalidatesTags: [TAGS.MENTORSHIP_REQUESTS],
    }),
  }),
});

export const {
  useGetMentorshipOverviewQuery,
  useAcceptMentorshipRequestMutation,
  useRejectMentorshipRequestMutation,
} = alumniMentorshipApi;
