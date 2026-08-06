import { baseApi } from "./baseApi";

/**
 * Alumni Mentorship API — covers:
 *   GET  /alumni/mentorship                          (requests + mentees overview)
 *   POST /alumni/mentorship/requests/:id/accept
 *   POST /alumni/mentorship/requests/:id/reject
 *
 * Reuses the "MentorshipRequests" tag that studentMentorshipApi's
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
      providesTags: ["MentorshipRequests"],
    }),

    acceptMentorshipRequest: builder.mutation({
      query: (requestId) => ({
        url: `/alumni/mentorship/requests/${requestId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["MentorshipRequests"],
    }),

    rejectMentorshipRequest: builder.mutation({
      query: (requestId) => ({
        url: `/alumni/mentorship/requests/${requestId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["MentorshipRequests"],
    }),
  }),
});

export const {
  useGetMentorshipOverviewQuery,
  useAcceptMentorshipRequestMutation,
  useRejectMentorshipRequestMutation,
} = alumniMentorshipApi;