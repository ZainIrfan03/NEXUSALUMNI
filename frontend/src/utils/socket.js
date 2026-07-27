import { io } from "socket.io-client";

/**
 * Single shared socket instance for the whole app.
 * Call connectSocket(token) once after login; call disconnectSocket() on logout.
 */
let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io("http://localhost:5000", {
    auth: { token }, // read by the `io.use(...)` middleware in server.js
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