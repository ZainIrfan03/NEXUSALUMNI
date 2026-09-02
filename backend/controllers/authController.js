const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const AppError = require("../errors/AppError");
const {
  HTTP_STATUS,
  AUTH_COOKIE_NAME,
  ROLES,
  JWT_PERSISTENT_EXPIRY,
  JWT_SESSION_EXPIRY,
  AUTH_COOKIE_MAX_AGE_MS,
} = require("../constants");
const { IS_PRODUCTION, JWT_SECRET } = require("../config/env");
const generateToken = (id, role, keepSignedIn = true) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: keepSignedIn ? JWT_PERSISTENT_EXPIRY : JWT_SESSION_EXPIRY,
  });
};

const setLoginTokenCookie = (res, token, keepSignedIn) => {
  const options = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
  };
  if (keepSignedIn) options.maxAge = AUTH_COOKIE_MAX_AGE_MS;
  res.cookie(AUTH_COOKIE_NAME, token, options);
};
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      department,
      session,
      rollNumber,
      graduationYear,
      company,
      jobTitle,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Missing required fields" });
    }

    const allowedPublicRoles = [ROLES.STUDENT, ROLES.ALUMNI];
    if (!allowedPublicRoles.includes(role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message: "This role cannot be self-registered. Contact an administrator.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;

    await mongoose.connection.transaction(async (dbSession) => {
      const existingUser = await User.findOne({ email }).session(dbSession);
      if (existingUser) {
        throw new AppError("Email already registered", HTTP_STATUS.BAD_REQUEST);
      }

      [user] = await User.create(
        [
          {
            fullName,
            email,
            password: hashedPassword,
            role,
          },
        ],
        { session: dbSession }
      );

      if (role === ROLES.STUDENT) {
        await Student.create(
          [{ user: user._id, department, session, rollNumber }],
          { session: dbSession }
        );
      } else {
        await Alumni.create(
          [{ user: user._id, graduationYear, company, jobTitle }],
          { session: dbSession }
        );
      }
    });

    res.status(HTTP_STATUS.CREATED).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Email already registered", HTTP_STATUS.BAD_REQUEST);
    }
    throw error;
  }
};
const loginUser = async (req, res) => {
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
};
const logoutUser = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
};
const getCurrentUser = async (req, res) => {
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
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
