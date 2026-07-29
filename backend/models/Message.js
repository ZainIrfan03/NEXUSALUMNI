const mongoose = require("mongoose");

/**
 * Message — one document per chat message, linked to its Conversation.
 * A message can have text, a file/image attachment, or both —
 * but not neither (enforced below).
 */
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    seen: { type: Boolean, default: false },

    // Attachment fields — populated when the message includes an
    // uploaded image or file (via the uploadChat multer middleware).
    fileUrl: { type: String, default: null }, // e.g. "/uploads/chat/xxx.png"
    fileType: { type: String, enum: ["image", "file", null], default: null },
    fileName: { type: String, default: null }, // original filename, for display/download
  },
  { timestamps: true } // createdAt = message time
);

// A message must have at least text or an attachment.
messageSchema.pre("validate", function () {
  if (!this.text?.trim() && !this.fileUrl) {
    throw new Error("Message must contain text or an attachment.");
  }
});

module.exports = mongoose.model("Message", messageSchema);