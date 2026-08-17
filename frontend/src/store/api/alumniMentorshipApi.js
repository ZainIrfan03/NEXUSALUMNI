import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

/**
 * Alumni Mentorship API — covers:
 *   GET  /alumni/mentorship                          (requests + mentees overview)
 *   POST /alumni/mentorship/requests/:id/accept
 *   POST /alumni/mentorship/requests/:id/reject
 *
 * Reuses the TAGS.MENTORSHIP_REQUESTS tag that studentMentorshipApi's
 * getMyRequests already provides — same tag type declared once in
 * baseApi, just standing in for "the mentorship request state has
 * changed" on whichever side is looking at it. accept/reject invalidate
 * it, so the overview (active count, requests, mentees table) refetches
 * automatically — no manual fetchMentorship() call after every action.
 */
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
