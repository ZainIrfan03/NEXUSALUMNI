require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const connectDB = require("./config/db");
const path = require("path");

const directoryRoutes = require("./routes/directoryRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alumniProfileRoutes = require("./routes/alumniProfileRoutes");
const alumniDashboardRoutes = require("./routes/alumniDashboardRoutes");
const alumniMentorshipRoutes = require("./routes/alumniMentorshipRoutes");
const alumniJobRoutes = require("./routes/alumniJobRoutes");
const alumniDirectoryRoutes = require("./routes/alumniDirectoryRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const activityRoutes = require("./routes/activityRoutes");
const FRONTEND_URL = process.env.FRONTEND_URL;

connectDB(); // connect to MongoDB before anything else

const app = express();

// credentials: true is required so the browser is allowed to send/receive
// the httpOnly auth cookie across origins (frontend on :5173, backend on :5000)
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());  // parse JSON request bodies
app.use(cookieParser());  // parse cookies into req.cookies
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/student/profile", studentProfileRoutes);
app.use("/api/student/dashboard", dashboardRoutes);
app.use("/api/student/activity", activityRoutes);
app.use("/api/alumni/profile", alumniProfileRoutes);
app.use("/api/alumni/dashboard", alumniDashboardRoutes);
app.use("/api/alumni/mentorship", alumniMentorshipRoutes);
app.use("/api/alumni/jobs", alumniJobRoutes);
app.use("/api/alumni/directory", alumniDirectoryRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Alumni Nexus API is running");
});

// --- Socket.io setup ---
// Express needs a raw http server so Socket.io can attach to the same port.
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONTEND_URL, credentials: true },
});

// Tracks which socket belongs to which logged-in user, so a message can be
// emitted straight to that specific user (no rooms/broadcast needed for 1:1 chat).
const onlineUsers = new Map(); // userId -> socketId

// Runs once per client connection attempt, before "connection" fires.
// Client must connect with { withCredentials: true } so the browser
// includes the httpOnly "token" cookie in the handshake request headers
// (socket.io doesn't parse cookies itself, so we do it manually here).
io.use((socket, next) => {
  const rawCookie = socket.handshake.headers.cookie;
  const token = rawCookie ? cookie.parse(rawCookie).token : null;

  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  onlineUsers.set(socket.userId, socket.id);
  console.log(`User connected: ${socket.userId}`);

  // Client emits this while the other person is typing
  socket.on("typing", ({ conversationId, toUserId }) => {
    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("typing", { conversationId, fromUserId: socket.userId });
    }
  });

  // Client emits this to send a message
  socket.on("sendMessage", async ({ conversationId, text, toUserId }) => {
    try {
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        text,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastMessageAt: new Date(),
      });

      // Deliver instantly if the recipient is online right now
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("receiveMessage", message);
      }

      // Echo back to the sender so their UI updates from the same
      // saved document instead of a separate optimistic message
      socket.emit("messageSent", message);
    } catch (error) {
      socket.emit("messageError", { message: "Failed to send message" });
    }
  });

  // Attachment messages are saved via the REST endpoint (multer needs a
  // regular HTTP request), not the "sendMessage" socket event above — so
  // once the frontend gets the saved message back from that REST call, it
  // emits this event just to relay it live to the other participant.
  socket.on("fileMessageSent", ({ message, toUserId }) => {
    const targetSocketId = onlineUsers.get(toUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receiveMessage", message);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log(`User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));