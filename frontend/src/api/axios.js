import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  // Sends the httpOnly "token" cookie set by the backend on login/register.
  // (Also set globally in main.jsx for raw axios calls elsewhere in the app.)
  withCredentials: true,
});

export default api;