const jwt = require("jsonwebtoken");

// Verifies the JWT and attaches the decoded { id, role } to req.user for use
// in protected routes. Prefers the httpOnly "token" cookie; falls back to the
// old "Authorization: Bearer <token>" header while the frontend is still
// being migrated over to cookie-based auth.
const protect = (req, res, next) => {
  let token = req.cookies?.token || null;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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