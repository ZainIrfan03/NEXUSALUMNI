import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import { baseApi } from "./api/baseApi";
import { authListenerMiddleware } from "./middleware/authListenerMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  
  
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(authListenerMiddleware.middleware)
      .concat(baseApi.middleware),
});
