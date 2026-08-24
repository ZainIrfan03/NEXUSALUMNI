import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const studentDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/student/dashboard",
      providesTags: [TAGS.STUDENT_DASHBOARD, TAGS.MENTORSHIP_REQUESTS],
    }),

    getRecentActivity: builder.query({
      query: () => "/student/activity",
      providesTags: [TAGS.STUDENT_DASHBOARD],
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetRecentActivityQuery } =
  studentDashboardApi;
