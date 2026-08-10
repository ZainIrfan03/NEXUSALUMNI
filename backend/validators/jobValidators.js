const { body } = require("express-validator");
const { JOB_TYPE, JOB_STATUS } = require("../utils/constants");

// @route POST /api/jobs — alumni creating a new posting
const createJobValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("department").optional({ values: "falsy" }).trim(),
  body("payRange").optional({ values: "falsy" }).trim(),
  body("description").optional({ values: "falsy" }).trim(),

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

module.exports = { createJobValidators };