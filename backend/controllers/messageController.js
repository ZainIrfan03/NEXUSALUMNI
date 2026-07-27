 const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @route  GET /api/messages/conversations
// List of the logged-in user's conversations (for the Inbox list).
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "fullName email role")
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
// @body   { text }
// Saves a message to the DB. The socket layer (server.js) additionally
// emits it live to the other participant — this route is the source of truth.
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastMessageAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMyConversations, startConversation, getMessages, sendMessage };