import { createListenerMiddleware } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import { logout } from "../slice/authSlice";

export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
  actionCreator: logout,
  effect: (_, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});
