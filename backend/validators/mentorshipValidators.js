const { body } = require("express-validator");

// @route POST /api/mentorship/request
const sendMentorshipRequestValidators = [
  body("alumniId").isMongoId().withMessage("alumniId must be a valid id"),
  body("message")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Message must not exceed 500 characters"),
];

module.exports = { sendMentorshipRequestValidators };