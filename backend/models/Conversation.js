 const mongoose = require("mongoose");

/**
 * Conversation — one document per pair of users chatting
 * (student <-> alumni, or any role combo).
 * `participants` always has exactly 2 users for a 1:1 chat.
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);