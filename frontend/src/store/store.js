import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // jobsSlice, mentorshipSlice, eventsSlice will be added here later
  },
});