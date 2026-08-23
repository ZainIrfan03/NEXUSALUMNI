import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => "/auth/me",
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (account) => ({
        url: "/auth/register",
        method: "POST",
        body: account,
      }),
    }),

    endSession: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useLoginMutation,
  useRegisterMutation,
  useEndSessionMutation,
} = authApi;
