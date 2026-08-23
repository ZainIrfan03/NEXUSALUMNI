import { baseApi } from "./baseApi";

export const publicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeaturedAlumni: builder.query({
      query: (limit) => ({
        url: "/directory/featured",
        params: { limit },
      }),
    }),

    getSuccessStories: builder.query({
      query: (params) => ({
        url: "/stories",
        params,
      }),
    }),

    getStoryCategories: builder.query({
      query: () => "/stories/categories",
    }),
  }),
});

export const {
  useGetFeaturedAlumniQuery,
  useLazyGetSuccessStoriesQuery,
  useGetStoryCategoriesQuery,
} = publicApi;
