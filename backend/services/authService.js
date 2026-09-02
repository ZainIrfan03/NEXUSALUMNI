const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const AppError = require("../errors/AppError");
const {
  HTTP_STATUS,
  JWT_PERSISTENT_EXPIRY,
  JWT_SESSION_EXPIRY,
  ROLES,
} = require("../constants");
const { JWT_SECRET } = require("../config/env");

const toPublicUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
});

const createToken = (user, keepSignedIn) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: keepSignedIn ? JWT_PERSISTENT_EXPIRY : JWT_SESSION_EXPIRY,
  });

const registerUser = async (data) => {
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
  } = data;

  if (!fullName || !email || !password || !role) {
    throw new AppError("Missing required fields", HTTP_STATUS.BAD_REQUEST);
  }
  if (![ROLES.STUDENT, ROLES.ALUMNI].includes(role)) {
    throw new AppError(
      "This role cannot be self-registered. Contact an administrator.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
  let user;

  try {
    await mongoose.connection.transaction(async (dbSession) => {
      const existingUser = await User.findOne({ email }).session(dbSession);
      if (existingUser) {
        throw new AppError("Email already registered", HTTP_STATUS.BAD_REQUEST);
      }

      [user] = await User.create(
        [{ fullName, email, password: hashedPassword, role }],
        { session: dbSession },
      );

      const profile =
        role === ROLES.STUDENT
          ? { user: user._id, department, session, rollNumber }
          : { user: user._id, graduationYear, company, jobTitle };
      const ProfileModel = role === ROLES.STUDENT ? Student : Alumni;
      await ProfileModel.create([profile], { session: dbSession });
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Email already registered", HTTP_STATUS.BAD_REQUEST);
    }
    throw error;
  }

  return toPublicUser(user);
};

const authenticateUser = async ({ email, password, keepSignedIn = false }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  return {
    token: createToken(user, keepSignedIn),
    user: toPublicUser(user),
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("fullName email role");
  if (!user) {
    throw new AppError("Session user not found", HTTP_STATUS.UNAUTHORIZED);
  }
  return toPublicUser(user);
};

module.exports = { authenticateUser, getCurrentUser, registerUser };
