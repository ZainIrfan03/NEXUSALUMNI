const { body } = require("express-validator");
const {
  JOB_TYPE,
  JOB_STATUS,
  EXPERIENCE_LEVEL,
  INTERVIEW_RESPONSE,
  JOB_REQUIREMENTS_MAX_COUNT,
} = require("../constants");
const createJobValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("department").optional({ values: "falsy" }).trim(),
  body("payRange").optional({ values: "falsy" }).trim(),
  body("description").optional({ values: "falsy" }).trim(),
  body("requirements").optional().isArray({ max: JOB_REQUIREMENTS_MAX_COUNT }).withMessage("Requirements must be a list"),
  body("requirements.*").optional().trim().notEmpty().withMessage("Requirements cannot be empty"),
  body("experienceLevel")
    .optional({ values: "falsy" })
    .isIn(Object.values(EXPERIENCE_LEVEL))
    .withMessage("Invalid experience level"),
  body("deadline")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .custom((value) => new Date(value) > new Date())
    .withMessage("Deadline must be in the future"),

  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(Object.values(JOB_TYPE))
    .withMessage(`Type must be one of: ${Object.values(JOB_TYPE).join(", ")}`),

  body("status")
    .optional({ values: "falsy" })
    .isIn(Object.values(JOB_STATUS))
    .withMessage(`Status must be one of: ${Object.values(JOB_STATUS).join(", ")}`),
];

const interviewResponseValidators = [
  body("response")
    .isIn([INTERVIEW_RESPONSE.CONFIRMED, INTERVIEW_RESPONSE.RESCHEDULE_REQUESTED])
    .withMessage("Invalid interview response"),
];

module.exports = { createJobValidators, interviewResponseValidators };
