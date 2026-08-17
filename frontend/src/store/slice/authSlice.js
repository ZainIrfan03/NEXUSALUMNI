import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_USER_KEY } from "../../consts/appConstants";

// On app load, try to restore the real session from localStorage
// (so refreshing the page doesn't log the user out).
const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

// ── DEV-ONLY MOCK LOGIN ──────────────────────────────────────────────
// Lets you jump straight into a dashboard without going through /login.
// Only works when running `npm run dev` (import.meta.env.DEV) AND only
// when you explicitly opt in via a URL query param, e.g.:
//   http://localhost:5173/dashboard/student?mock=student
//   http://localhost:5173/dashboard/alumni?mock=alumni
// Stored in sessionStorage (not the "user" localStorage key) so it never
// collides with a real session, and logout() clears it too.
function getMockUser() {
  if (!import.meta.env.DEV) return null;

  const params = new URLSearchParams(window.location.search);
  const mockRole = params.get("mock");

  if (mockRole) {
    const mockUser = {
      _id: `mock-${mockRole}-1`,
      fullName: "Alex Sterling",
      email: "alex@test.com",
      role: mockRole, // student | alumni | faculty | admin
    };
    sessionStorage.setItem("mock_user", JSON.stringify(mockUser));
    return mockUser;
  }

  const savedMock = sessionStorage.getItem("mock_user");
  return savedMock ? JSON.parse(savedMock) : null;
}
// ──────────────────────────────────────────────────────────────────────

const activeUser = storedUser ? JSON.parse(storedUser) : getMockUser();

const initialState = {
  user: activeUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called right after a successful login/register API response
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(action.payload));
    },
    // Called on logout
    logout: (state) => {
      state.user = null;
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      sessionStorage.removeItem("mock_user"); // also clear any active mock
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
