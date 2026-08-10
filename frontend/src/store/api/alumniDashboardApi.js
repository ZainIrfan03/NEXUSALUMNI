import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/const";

/**
 * Alumni Dashboard API — covers:
 *   GET /alumni/dashboard   (studentsMentored, jobsPosted, incomingRequests)
 *
 * Accept/decline on this page reuse the existing
 * `useAcceptMentorshipRequestMutation` / `useRejectMentorshipRequestMutation`
 * from alumniMentorshipApi.js (same hooks AlumniMentorship.jsx uses) instead
 * of new dashboard-scoped mutations. Those already invalidate
 * TAGS.MENTORSHIP_REQUESTS on success — so getOverview lists it in
 * providesTags too, meaning the incomingRequests preview (and the
 * studentsMentored count once one is accepted) refetch automatically
 * with no manual fetchOverview() call after every action.
 */
export const alumniDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlumniOverview: builder.query({
      query: () => "/alumni/dashboard",
      providesTags: [TAGS.ALUMNI_DASHBOARD, TAGS.MENTORSHIP_REQUESTS],
    }),
  }),
});

export const { useGetAlumniOverviewQuery } = alumniDashboardApi;