import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  // Sends the httpOnly "token" cookie set by the backend on login/register.
  // (Also set globally in main.jsx for raw axios calls elsewhere in the app.)
  withCredentials: true,
});

export default api;