// Centralizes access to required environment variables. Importing
// process.env.JWT_SECRET directly in 4 different files (app.js,
// authMiddleware.js, authController.js x2) meant a typo'd var name
// would silently become `undefined` at runtime instead of failing
// fast at startup. Every file should require this instead of reading
// process.env directly.

if (!process.env.JWT_SECRET) {
  console.error("Missing required env var: JWT_SECRET");
  process.exit(1); // same fail-fast behavior as config/db.js on a bad MONGO_URI
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
};