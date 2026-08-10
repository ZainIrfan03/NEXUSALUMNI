// middleware/errorHandler.js
//
// Two pieces, both wired in app.js AFTER all routes:
//
//   app.use(notFound);       // unmatched routes -> 404 JSON instead of default HTML
//   app.use(errorHandler);   // any err passed to next(err) -> consistent JSON response
//
// Controllers can keep their own try/catch as-is (this doesn't replace that).
// This is the safety net for everything else: multer errors, mongoose errors,
// jwt errors, and any async error thrown in middleware that isn't wrapped in
// try/catch (e.g. the socket.io auth middleware style code, or a future route
// that forgets one). Without this, an uncaught error in middleware crashes
// the process instead of sending a graceful response.

const multer = require("multer");
const { HTTP_STATUS } = require("../utils/constants");

// Runs when no route matched the request at all.
const notFound = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Express recognizes this as an error handler because it takes 4 args.
// Must be registered last, after every other app.use()/route.
const errorHandler = (err, req, res, next) => {
  // If a response was already partially sent, hand off to Express's
  // default handler instead of trying to send headers twice.
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  // ---- Multer upload errors (file too large, unexpected field, etc.) ----
  if (err instanceof multer.MulterError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
  }

  // ---- Custom fileFilter errors from uploadMiddleware.js ----
  // (those reject with a plain `new Error("Only PNG, JPG...")`)
  if (
    err.message &&
    /only (png|jpg|webp|pdf|images)/i.test(err.message)
  ) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
  }

  // ---- Mongoose bad ObjectId (e.g. /api/jobs/not-a-valid-id) ----
  if (err.name === "CastError") {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // ---- Mongoose schema validation errors ----
  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Validation failed", errors });
  }

  // ---- Mongoose duplicate key (unique index violation, e.g. email) ----
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: `${field} already exists` });
  }

  // ---- JWT errors that slipped past authMiddleware's own try/catch ----
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: "Invalid or expired token" });
  }

  // ---- Fallback: anything else is an unexpected server error ----
  const status = err.statusCode || HTTP_STATUS.SERVER_ERROR;
  res.status(status).json({
    message: status === HTTP_STATUS.SERVER_ERROR ? "Something went wrong on the server" : err.message,
  });
};

module.exports = { notFound, errorHandler };