// utils/socketManager.js
// Small shared module so REST controllers (which run outside app.js's
// socket.io connection handler) can still emit live events — needed
// because file/image uploads go through multer on a normal HTTP route,
// not through the "sendMessage" socket event.

let io = null;
const onlineUsers = new Map(); // userId -> socketId, filled in by app.js

const setIO = (ioInstance) => {
  io = ioInstance;
};

const getIO = () => io;

module.exports = { setIO, getIO, onlineUsers };