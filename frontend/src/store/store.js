import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // RTK Query's middleware enables caching, invalidation, polling, etc.
  // Every feature api file (jobsApi, mentorshipApi, ...) injects into the
  // same baseApi, so registering it once here covers all of them.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});