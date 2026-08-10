const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const { AUTH_COOKIE_NAME } = require("../utils/constants");

// Verifies the JWT from the httpOnly "token" cookie and attaches the
// decoded { id, role } to req.user for use in protected routes.
const protect = (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};


// Restricts a route to specific roles, e.g. authorize("admin", "faculty")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied for this role" });
    }
    next();
  };
};

module.exports = { protect, authorize };