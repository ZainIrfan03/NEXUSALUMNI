const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @route  GET /api/messages/conversations
// List of the logged-in user's conversations (for the Inbox list).
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "fullName email role profileImage")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/messages/conversations
// @body   { otherUserId }
// Finds an existing 1:1 conversation or creates a new one —
// called when a student clicks "Message" on an alumni's profile card.
const startConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const myId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherUserId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [myId, otherUserId] });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/messages/:conversationId
// Full message history for one conversation.
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/messages/:conversationId
// @body   { text }  (multipart/form-data — optional "file" field for image/attachment)
// Saves a message to the DB. Requires either non-empty text or an uploaded
// file (via the uploadChat multer middleware, which sets req.file).
// The socket layer (server.js) additionally emits it live to the other
// participant — this route is the source of truth.
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    // Must have text or a file attached
    if (!text?.trim() && !req.file) {
      return res.status(400).json({ message: "Message must contain text or a file." });
    }

    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (req.file) {
      fileUrl = `/uploads/chat/${req.file.filename}`;
      fileType = req.file.mimetype.startsWith("image/") ? "image" : "file";
      fileName = req.file.originalname;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: text?.trim() || "",
      fileUrl,
      fileType,
      fileName,
    });

    const lastMessagePreview = text?.trim()
      ? text.trim()
      : fileType === "image"
      ? "📷 Photo"
      : "📎 File";

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: lastMessagePreview,
      lastMessageAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/messages/conversations/:conversationId
// Deletes a conversation and all its messages (used by the three-dots
// "Delete Chat" menu option). Only a participant of the conversation
// can delete it.
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyConversations,
  startConversation,
  getMessages,
  sendMessage,
  deleteConversation,
};