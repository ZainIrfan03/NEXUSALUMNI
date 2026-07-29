const path = require("path");
const fs = require("fs");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Alumni = require("../models/Alumni");
const Student = require("../models/Student");

// avatarUrl lives on the Alumni/Student profile documents, not on User,
// so conversation participants (which only populate User fields) need a
// small extra lookup before being sent to the frontend.
const attachAvatars = async (conversations) => {
  const list = Array.isArray(conversations) ? conversations : [conversations];
  if (list.length === 0) return conversations;

  const userIds = [
    ...new Set(list.flatMap((c) => c.participants.map((p) => p._id.toString()))),
  ];

  const [alumniProfiles, studentProfiles] = await Promise.all([
    Alumni.find({ user: { $in: userIds } }).select("user avatarUrl"),
    Student.find({ user: { $in: userIds } }).select("user avatarUrl"),
  ]);

  const avatarMap = new Map();
  alumniProfiles.forEach((a) => avatarMap.set(a.user.toString(), a.avatarUrl || null));
  studentProfiles.forEach((s) => avatarMap.set(s.user.toString(), s.avatarUrl || null));

  const withAvatars = list.map((c) => {
    const convo = c.toObject ? c.toObject() : c;
    convo.participants = convo.participants.map((p) => ({
      ...p,
      avatarUrl: avatarMap.get(p._id.toString()) || null,
    }));
    return convo;
  });

  return Array.isArray(conversations) ? withAvatars : withAvatars[0];
};

// @route  GET /api/messages/conversations
// List of the logged-in user's conversations (for the Inbox list).
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "fullName email role")
      .sort({ lastMessageAt: -1 });

    res.json(await attachAvatars(conversations));
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

    conversation = await conversation.populate("participants", "fullName email role");

    res.json(await attachAvatars(conversation));
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
// @form   multipart/form-data — { text?, file? } (field name "file", see uploadChat middleware)
// Saves a message to the DB, with an optional image/file attachment.
// Used for attachment sends; plain-text sends still go through the socket
// "sendMessage" event for lower latency.
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    if (!text?.trim() && !req.file) {
      return res.status(400).json({ message: "Message must contain text or an attachment." });
    }

    const messageData = {
      conversation: conversationId,
      sender: req.user.id,
      text: text || "",
    };

    if (req.file) {
      const isImage = req.file.mimetype.startsWith("image/");
      messageData.fileUrl = `/uploads/chat/${req.file.filename}`;
      messageData.fileType = isImage ? "image" : "file";
      messageData.fileName = req.file.originalname;
    }

    const message = await Message.create(messageData);

    const preview = text?.trim() ? text : req.file ? `📎 ${req.file.originalname}` : "";

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: preview,
      lastMessageAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/messages/conversations/:conversationId
// Deletes an entire conversation: every message in it, any uploaded chat
// attachments on disk, and the conversation document itself.
// Only a participant of the conversation may delete it.
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
      return res.status(403).json({ message: "Not authorized to delete this conversation" });
    }

    const messages = await Message.find({ conversation: conversationId }).select("fileUrl");

    // Best-effort cleanup of any attached files — a missing file shouldn't
    // block the conversation from being deleted.
    messages.forEach((m) => {
      if (m.fileUrl) {
        const filePath = path.join(__dirname, "..", m.fileUrl);
        fs.unlink(filePath, () => {});
      }
    });

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Conversation deleted", conversationId });
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