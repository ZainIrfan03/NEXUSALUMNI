import { baseApi } from "./baseApi";

/**
 * Student Dashboard API — covers:
 *   GET /student/dashboard   (stat cards: totalAlumni, pendingRequests, savedJobs)
 *   GET /student/activity    (recent activity feed)
 *
 * Recommended mentors are NOT duplicated here — StudentDashboard.jsx reuses
 * `useGetRecommendedMentorsQuery` from studentMentorshipApi, same as
 * Mentorship.jsx does, so both pages share one cached request.
 *
 * "MentorshipRequests" is included in getDashboardStats' providesTags
 * because `pendingRequests` in the stats payload changes whenever a
 * mentorship request is sent/accepted/rejected elsewhere in the app —
 * without it the stat card would go stale until a manual refresh.
 */
export const studentDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/student/dashboard",
      providesTags: ["StudentDashboard", "MentorshipRequests"],
    }),

    getRecentActivity: builder.query({
      query: () => "/student/activity",
      providesTags: ["StudentDashboard"],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetRecentActivityQuery } = studentDashboardApi;