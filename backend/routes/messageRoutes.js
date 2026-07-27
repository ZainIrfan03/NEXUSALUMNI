const express = require("express");
const {
  getMyConversations,
  startConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { uploadChat } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/conversations", protect, getMyConversations);
router.post("/conversations", protect, startConversation);
router.delete("/conversations/:conversationId", protect, deleteConversation);

router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId", protect, uploadChat.single("file"), sendMessage);

module.exports = router;