const { body } = require("express-validator");
const { MENTORSHIP_MESSAGE_MAX_LENGTH } = require("../constants");
const sendMentorshipRequestValidators = [
  body("alumniId").isMongoId().withMessage("alumniId must be a valid id"),
  body("message")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: MENTORSHIP_MESSAGE_MAX_LENGTH })
    .withMessage(`Message must not exceed ${MENTORSHIP_MESSAGE_MAX_LENGTH} characters`),
];

module.exports = { sendMentorshipRequestValidators };
