import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_BASE_URL, TAGS } from "../../consts/appConstants";

/**
 * Single RTK Query instance for the whole app. Every feature (jobs,
 * mentorship, messages, profile, dashboard...) gets its own file, but
 * they all call `baseApi.injectEndpoints(...)` instead of creating a
 * separate `createApi()` — that way there's only one reducer slice
 * (`baseApi.reducerPath`) and one middleware to register in store.js,
 * no matter how many feature files exist.
 *
 * Auth: the backend uses an httpOnly cookie (see api/axios.js), so
 * `credentials: "include"` is all that's needed here — no manual
 * Authorization header to attach or keep in sync.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  // Every cache tag used by any feature slice must be declared here up
  // front — injectEndpoints can't add new tag types later.
  tagTypes: Object.values(TAGS),
  endpoints: () => ({}),
});
