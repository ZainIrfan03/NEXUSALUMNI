import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_USER_KEY } from "../../consts/appConstants";



const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

function parseStoredUser(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    return null;
  }
}

const persistedUser = parseStoredUser(storedUser);

const initialState = {
  user: persistedUser,
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.authChecked = true;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(action.payload));
    },
    
    logout: (state) => {
      state.user = null;
      state.authChecked = true;
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
