const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const {
  AUTH_COOKIE_NAME,
  MESSAGE_MAX_LENGTH,
  SOCKET_EVENTS,
} = require("../constants");
const { FRONTEND_URL, JWT_SECRET } = require("./env");

const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: { origin: FRONTEND_URL, credentials: true },
  });

  app.set("io", io);

  io.use(async (socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    const token = rawCookie
      ? cookie.parse(rawCookie)[AUTH_COOKIE_NAME]
      : null;

    if (!token) return next(new Error("No token provided"));

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id");
      if (!user) return next(new Error("Session user not found"));

      socket.userId = user._id.toString();
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);
    console.log(`User connected: ${socket.userId}`);

    const getConversationRecipient = async (conversationId) => {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      }).select("participants");

      if (!conversation || conversation.participants.length !== 2) return null;

      return conversation.participants
        .find(
          (participantId) => participantId.toString() !== socket.userId,
        )
        ?.toString();
    };

    socket.on(SOCKET_EVENTS.TYPING, async ({ conversationId } = {}) => {
      try {
        const recipientId = await getConversationRecipient(conversationId);
        if (!recipientId) return;

        io.to(recipientId).emit(SOCKET_EVENTS.TYPING, {
          conversationId,
          fromUserId: socket.userId,
        });
      } catch {
        // Ignore invalid or unauthorized typing events.
      }
    });

    socket.on(
      SOCKET_EVENTS.SEND_MESSAGE,
      async ({ conversationId, text } = {}) => {
        try {
          if (
            typeof text !== "string" ||
            !text.trim() ||
            text.length > MESSAGE_MAX_LENGTH
          ) {
            return socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
              message: `Message must contain between 1 and ${MESSAGE_MAX_LENGTH} characters`,
            });
          }

          const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: socket.userId,
          });

          if (!conversation || conversation.participants.length !== 2) {
            return socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
              message: "Not authorized to send messages in this conversation",
            });
          }

          const recipientId = conversation.participants
            .find(
              (participantId) => participantId.toString() !== socket.userId,
            )
            ?.toString();

          if (!recipientId) {
            return socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
              message: "Conversation recipient not found",
            });
          }

          const message = await Message.create({
            conversation: conversationId,
            sender: socket.userId,
            text: text.trim(),
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message.text,
            lastMessageAt: new Date(),
          });

          io.to(recipientId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
          return socket.emit(SOCKET_EVENTS.MESSAGE_SENT, message);
        } catch {
          return socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
            message: "Failed to send message",
          });
        }
      },
    );

    socket.on(SOCKET_EVENTS.FILE_MESSAGE_SENT, async ({ messageId } = {}) => {
      try {
        const message = await Message.findOne({
          _id: messageId,
          sender: socket.userId,
        });
        if (!message) return;

        const recipientId = await getConversationRecipient(
          message.conversation,
        );
        if (!recipientId) return;

        io.to(recipientId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
      } catch {
        socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
          message: "Failed to relay attachment message",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
