require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
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

connectDB(); // connect to MongoDB before anything else

const app = express();

const FRONTEND_URL = "http://localhost:5173"; // apna frontend URL

app.use(cors({ origin: FRONTEND_URL })); // allow requests from the React frontend
app.use(express.json());  // parse JSON request bodies
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
  cors: { origin: FRONTEND_URL },
});

// Tracks which socket belongs to which logged-in user, so a message can be
// emitted straight to that specific user (no rooms/broadcast needed for 1:1 chat).
const onlineUsers = new Map(); // userId -> socketId

// Runs once per client connection attempt, before "connection" fires.
// Client must connect like: io(URL, { auth: { token } })
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
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

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log(`User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));