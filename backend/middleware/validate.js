const { validationResult } = require("express-validator");
const fs = require("fs");
const { HTTP_STATUS } = require("../constants");

// Drop this in AFTER a list of express-validator checks on any route.
// Collects whatever those checks found wrong and, if anything failed,
// short-circuits with a single consistent 400 shape instead of letting
// bad data reach the controller.
//
//   router.post("/register", registerValidators, validate, registerUser);
//
const validate = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // Multer writes multipart files before body validators can inspect the
  // parsed fields. If validation rejects the request, remove that newly
  // written file so it does not become an orphan on disk.
  if (req.file?.path) {
    try {
      await fs.promises.unlink(req.file.path);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Failed to clean rejected upload ${req.file.path}:`, error);
      }
    }
  }

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
