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
const { startConversationValidators, sendMessageValidators } = require("../validators/messageValidators");
const { validateMongoIdParam } = require("../validators/paramValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.get("/conversations", protect, getMyConversations);
router.post("/conversations", protect, startConversationValidators, validate, startConversation);
router.delete(
  "/conversations/:conversationId",
  protect,
  validateMongoIdParam("conversationId"),
  validate,
  deleteConversation
);

router.get("/:conversationId", protect, validateMongoIdParam("conversationId"), validate, getMessages);
router.post(
  "/:conversationId",
  protect,
  validateMongoIdParam("conversationId"),
  uploadChat.single("file"),
  sendMessageValidators,
  validate,
  sendMessage
);

module.exports = router;