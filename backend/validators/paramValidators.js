const { param } = require("express-validator");

// Validates that a route :param is a well-formed Mongo ObjectId.
// Without this, an invalid id (e.g. "abc") reaches Mongoose and throws
// a CastError that gets caught by the generic try/catch as a 500 —
// this turns it into a clean 400 instead.
//
//   router.get("/:id", validateMongoIdParam("id"), validate, getJobApplicants);
//
const validateMongoIdParam = (paramName) =>
  param(paramName).isMongoId().withMessage(`${paramName} must be a valid id`);

module.exports = { validateMongoIdParam };