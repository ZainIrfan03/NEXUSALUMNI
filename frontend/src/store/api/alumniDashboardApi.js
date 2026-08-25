import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

export const alumniDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlumniOverview: builder.query({
      query: () => "/alumni/dashboard",
      providesTags: [TAGS.ALUMNI_DASHBOARD, TAGS.MENTORSHIP_REQUESTS],
    }),
  }),
});


export const { useGetAlumniOverviewQuery } = alumniDashboardApi;
