import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.authChecked = true;
    },

    logout: (state) => {
      state.user = null;
      state.authChecked = true;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
