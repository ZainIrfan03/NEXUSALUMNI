const { body } = require("express-validator");
const { APPLICATION_STATUS, INTERVIEW_LIMITS } = require("../constants");
const updateApplicationStatusValidators = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(Object.values(APPLICATION_STATUS))
    .withMessage(`Status must be one of: ${Object.values(APPLICATION_STATUS).join(", ")}`),
];

const scheduleInterviewValidators = [
  body("scheduledAt")
    .notEmpty()
    .withMessage("Interview date and time are required")
    .isISO8601()
    .withMessage("Interview date must be valid")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Interview must be scheduled in the future"),
  body("timezone").trim().notEmpty().withMessage("Timezone is required"),
  body("durationMinutes")
    .isInt({
      min: INTERVIEW_LIMITS.MIN_DURATION_MINUTES,
      max: INTERVIEW_LIMITS.MAX_DURATION_MINUTES,
    })
    .withMessage(
      `Duration must be between ${INTERVIEW_LIMITS.MIN_DURATION_MINUTES} and ${INTERVIEW_LIMITS.MAX_DURATION_MINUTES} minutes`,
    ),
  body("meetingUrl")
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Enter a valid meeting URL"),
  body("instructions").optional({ values: "falsy" }).trim().isLength({
    max: INTERVIEW_LIMITS.INSTRUCTIONS_MAX_LENGTH,
  }),
];

module.exports = { updateApplicationStatusValidators, scheduleInterviewValidators };
