const { body } = require("express-validator");
const startConversationValidators = [
  body("otherUserId").isMongoId().withMessage("otherUserId must be a valid id"),
];
const sendMessageValidators = [
  body("text").optional({ values: "falsy" }).trim().isLength({ max: 4000 }),
];

module.exports = { startConversationValidators, sendMessageValidators };