import axios from "axios";
import { API_BASE_URL } from "../consts/const";
import { SOCKET_URL } from "../consts/const";

const api = axios.create({
  baseURL: API_BASE_URL,
  // Sends the httpOnly "token" cookie set by the backend on login/register.
  // (Also set globally in main.jsx for raw axios calls elsewhere in the app.)
  withCredentials: true,
});

export default api;