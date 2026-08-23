import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import authReducer, { logout } from "./slice/authSlice";
import { baseApi } from "./api/baseApi";

// Clear every user-specific RTK Query cache entry whenever the session ends.
// Listening to the shared logout action covers manual logout, API 401s, and a
// failed session check without duplicating reset logic in each caller.
const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: (_, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // RTK Query's middleware enables caching, invalidation, polling, etc.
  // Every feature api file (jobsApi, mentorshipApi, ...) injects into the
  // same baseApi, so registering it once here covers all of them.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authListenerMiddleware.middleware)
      .concat(baseApi.middleware),
});
