const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Admin/Faculty are never created through this open endpoint.
    const allowedPublicRoles = ["student", "alumni"];
    if (!allowedPublicRoles.includes(role)) {
      return res.status(403).json({
        message: "This role cannot be self-registered. Contact an administrator.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
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
        return res.status(400).json({ message: "Missing student fields" });
      }
      await Student.create({ user: user._id, department, session, rollNumber });
    } else if (role === "alumni") {
      if (!graduationYear) {
        return res.status(400).json({ message: "Missing alumni fields" });
      }
      await Alumni.create({ user: user._id, graduationYear, company, jobTitle });
    }

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/auth/login
// Logs in any role (student, alumni, faculty, admin) — same User collection.
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };