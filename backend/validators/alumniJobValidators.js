const { body } = require("express-validator");
const { APPLICATION_STATUS } = require("../utils/constants");

// @route PATCH /api/alumni/jobs/applications/:applicationId/status
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
    .isInt({ min: 15, max: 240 })
    .withMessage("Duration must be between 15 and 240 minutes"),
  body("meetingUrl")
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Enter a valid meeting URL"),
  body("instructions").optional({ values: "falsy" }).trim().isLength({ max: 1000 }),
];

module.exports = { updateApplicationStatusValidators, scheduleInterviewValidators };
