const fs = require("fs");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const MentorshipRequest = require("../models/MentorshipRequest");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const { HTTP_STATUS } = require("../utils/constants");

// @route GET /api/messages/unread-count
// Counts unseen messages sent by other users across this user's conversations.
const getUnreadMessageCount = async (req, res) => {
  try {
    const conversationIds = await Conversation.find({ participants: req.user.id }).distinct("_id");
    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user.id },
      seen: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route PATCH /api/messages/:conversationId/read
// Marks only messages received by the current user as read.
const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.exists({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Not authorized to view this conversation",
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        seen: false,
      },
      { $set: { seen: true } }
    );

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/messages/conversations
// List of the logged-in user's conversations (for the Inbox list).
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate("participants", "fullName email role")
      .sort({ lastMessageAt: -1 });

    const participantIds = [
      ...new Set(
        conversations.flatMap((conversation) =>
          conversation.participants
            .filter(Boolean)
            .map((participant) => participant._id.toString())
        )
      ),
    ];

    const [studentProfiles, alumniProfiles] = await Promise.all([
      Student.find({ user: { $in: participantIds } }).select("user avatarUrl"),
      Alumni.find({ user: { $in: participantIds } }).select("user avatarUrl"),
    ]);

    const avatarByUserId = new Map();
    [...studentProfiles, ...alumniProfiles].forEach((profile) => {
      if (profile.avatarUrl) {
        avatarByUserId.set(profile.user.toString(), profile.avatarUrl);
      }
    });

    const response = conversations.map((conversation) => ({
      ...conversation.toObject(),
      participants: conversation.participants.filter(Boolean).map((participant) => ({
          ...participant.toObject(),
          avatarUrl: avatarByUserId.get(participant._id.toString()) || null,
        })),
    }));

    res.json(response);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/messages/conversations
// @body   { otherUserId }
// Finds an existing 1:1 conversation or creates a new one —
// called when a student clicks "Message" on an accepted mentor's card, or
// an alumni clicks "Message" on an accepted mentee's profile.
//
// Chat is gated behind an accepted MentorshipRequest: whichever side is the
// student and whichever is the alumni in this pair, there must be a
// status: "accepted" request linking them. This stops alumni from
// messaging students they haven't accepted as mentees (and vice versa).
const startConversation = async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const myId = req.user.id;
    const myRole = req.user.role;

    const studentUserId = myRole === "student" ? myId : otherUserId;
    const alumniUserId = myRole === "alumni" ? myId : otherUserId;

    const acceptedRequest = await MentorshipRequest.findOne({
      student: studentUserId,
      alumni: alumniUserId,
      status: "accepted",
    });

    if (!acceptedRequest) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "You can only message an accepted mentor/mentee.",
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherUserId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [myId, otherUserId] });
    }

    res.json(conversation);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/messages/conversations/:conversationId
// Deletes a conversation and all its messages permanently.
// Called from the three-dots menu -> "Delete Chat".
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user.id
    );
    if (!isParticipant) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Not authorized to delete this chat" });
    }

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  GET /api/messages/:conversationId
// Full message history for one conversation.
// Only a participant of this conversation may read it.
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.find({ conversation: conversationId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/messages/:conversationId
// @body   { text }  (multipart/form-data)
// @file   file       (optional — image or document, handled by uploadChat middleware)
// Saves a message to the DB, with an optional attached image/file.
// The socket layer (server.js) additionally emits it live to the other participant.
// Only a participant of this conversation may send into it.
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.id,
    });

    if (!conversation) {
      // multer already wrote the uploaded file to disk before this
      // controller ran — clean it up so an unauthorized attempt
      // doesn't leave an orphaned file behind.
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "Not authorized to send messages in this conversation",
      });
    }

    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    if (req.file) {
      fileUrl = `/uploads/chat/${req.file.filename}`;
      fileType = req.file.mimetype.startsWith("image/") ? "image" : "file";
      fileName = req.file.originalname;
    }

    if (!text && !fileUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Message text or file is required" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      text: text || "",
      fileUrl,
      fileType,
      fileName,
    });

    const lastMessagePreview =
      text || (fileType === "image" ? "📷 Photo" : "📎 File");

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: lastMessagePreview,
      lastMessageAt: new Date(),
    });

    res.status(HTTP_STATUS.CREATED).json(message);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUnreadMessageCount,
  markConversationRead,
  getMyConversations,
  startConversation,
  deleteConversation,
  getMessages,
  sendMessage,
};
