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

module.exports = { updateApplicationStatusValidators };