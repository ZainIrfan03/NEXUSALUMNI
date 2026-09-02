const { body } = require("express-validator");
const { MESSAGE_MAX_LENGTH } = require("../constants");
const startConversationValidators = [
  body("otherUserId").isMongoId().withMessage("otherUserId must be a valid id"),
];
const sendMessageValidators = [
  body("text").optional({ values: "falsy" }).trim().isLength({ max: MESSAGE_MAX_LENGTH }),
];

module.exports = { startConversationValidators, sendMessageValidators };
