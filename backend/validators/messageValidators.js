const { body } = require("express-validator");

// @route POST /api/messages/conversations
const startConversationValidators = [
  body("otherUserId").isMongoId().withMessage("otherUserId must be a valid id"),
];

// @route POST /api/messages/:conversationId
// `text` is optional here (a file-only message is valid) — the
// controller itself already enforces "text OR file" is present.
const sendMessageValidators = [
  body("text").optional({ values: "falsy" }).trim().isLength({ max: 4000 }),
];

module.exports = { startConversationValidators, sendMessageValidators };