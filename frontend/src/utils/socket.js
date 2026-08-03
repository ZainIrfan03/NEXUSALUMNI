import { io } from "socket.io-client";

/**
 * Single shared socket instance for the whole app.
 * Call connectSocket() once after login; call disconnectSocket() on logout.
 * Auth is handled by the httpOnly "token" cookie (withCredentials: true) —
 * read by the io.use(...) middleware in the backend's app.js.
 */
let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:5000", {
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};