const { param } = require("express-validator");
const validateMongoIdParam = (paramName) =>
  param(paramName).isMongoId().withMessage(`${paramName} must be a valid id`);

module.exports = { validateMongoIdParam };