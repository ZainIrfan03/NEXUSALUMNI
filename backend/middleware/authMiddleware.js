const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");
const { AUTH_COOKIE_NAME, HTTP_STATUS } = require("../constants");

// Verifies the JWT from the httpOnly "token" cookie and attaches the
// decoded { id, role } to req.user for use in protected routes.
const protect = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Not authorized, user not found" });
    }

    // Use the current database role instead of trusting a possibly stale role
    // embedded in a still-valid token.
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Not authorized, token failed" });
  }
};

// Restricts a route to specific roles, e.g. authorize("admin", "faculty")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Access denied for this role" });
    }
    next();
  };
};

module.exports = { protect, authorize };
