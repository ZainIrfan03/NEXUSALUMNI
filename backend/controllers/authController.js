const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const {
  HTTP_STATUS,
  AUTH_COOKIE_NAME,
  ROLES,
  JWT_PERSISTENT_EXPIRY,
  JWT_SESSION_EXPIRY,
  AUTH_COOKIE_MAX_AGE_MS,
} = require("../utils/constants");
const { JWT_SECRET } = require("../config/env");
const generateToken = (id, role, keepSignedIn = true) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: keepSignedIn ? JWT_PERSISTENT_EXPIRY : JWT_SESSION_EXPIRY,
  });
};

const setLoginTokenCookie = (res, token, keepSignedIn) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  if (keepSignedIn) options.maxAge = AUTH_COOKIE_MAX_AGE_MS;
  res.cookie(AUTH_COOKIE_NAME, token, options);
};

// @route  POST /api/auth/register
// Public registration — only "student" and "alumni" are allowed here.
// Creates the base User first, then the matching profile document
// (Student or Alumni) that references that User's _id.
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      // student fields
      department,
      session,
      rollNumber,
      // alumni fields
      graduationYear,
      company,
      jobTitle,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Missing required fields" });
    }

    // Admin/Faculty are never created through this open endpoint.
    const allowedPublicRoles = [ROLES.STUDENT, ROLES.ALUMNI];
    if (!allowedPublicRoles.includes(role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "This role cannot be self-registered. Contact an administrator.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Create the base User (auth-only fields)
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    // 2. Create the role-specific profile, linked via `user: user._id`
    if (role === "student") {
      if (!department || !session || !rollNumber) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Missing student fields" });
      }
      await Student.create({ user: user._id, department, session, rollNumber });
    } else if (role === "alumni") {
      if (!graduationYear) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Missing alumni fields" });
      }
      await Alumni.create({ user: user._id, graduationYear, company, jobTitle });
    }

    res.status(HTTP_STATUS.CREATED).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/auth/login
// Logs in any role (student, alumni, faculty, admin) — same User collection.
const loginUser = async (req, res) => {
  try {
    const { email, password, keepSignedIn = false } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role, keepSignedIn);
    setLoginTokenCookie(res, token, keepSignedIn);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/auth/logout
// Clears the httpOnly auth cookie. Options passed to clearCookie must match
// the options used in setTokenCookie or the browser won't remove it.
const logoutUser = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
};

// @route GET /api/auth/me
// Verifies the JWT cookie and returns fresh identity data from the database.
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("fullName email role");
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Session user not found" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
