const { validationResult } = require("express-validator");
const { HTTP_STATUS } = require("../utils/constants");

// Drop this in AFTER a list of express-validator checks on any route.
// Collects whatever those checks found wrong and, if anything failed,
// short-circuits with a single consistent 400 shape instead of letting
// bad data reach the controller.
//
//   router.post("/register", registerValidators, validate, registerUser);
//
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // { fullName: "Full name is required", email: "Invalid email" } —
  // one message per field (first error wins) so the frontend can map
  // straight onto its form fields without extra parsing.
  const formatted = {};
  errors.array().forEach((err) => {
    if (!formatted[err.path]) formatted[err.path] = err.msg;
  });

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errors: formatted,
  });
};

module.exports = validate;