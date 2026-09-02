const Student = require("../models/Student");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { HTTP_STATUS } = require("../constants");
const getMyProfile = async (req, res) => {
  const student = await Student.findOne({ user: req.user.id }).populate(
    "user",
    "fullName email"
  );

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.json(student);
};
const updateMyProfile = async (req, res) => {
  const {
    fullName,
    location,
    headline,
    bio,
    skills,
    interests,
    isPublic,
    resumeUrl,
    openToNetworking,
  } = req.body;
  if (fullName) {
    await User.findByIdAndUpdate(req.user.id, { fullName });
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { location, headline, bio, skills, interests, isPublic, resumeUrl, openToNetworking },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.json(student);
};
const uploadAvatarImage = async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No image file uploaded." });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const existing = await Student.findOne({ user: req.user.id });
  if (!existing) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }
  if (existing.avatarUrl) {
    const oldPath = path.join(__dirname, "..", existing.avatarUrl);
    fs.unlink(oldPath, () => {}); // ignore errors (e.g. file already gone)
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { avatarUrl },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  res.json({ avatarUrl: student.avatarUrl });
};
const uploadResumeFile = async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No PDF file uploaded." });
  }

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;

  const existing = await Student.findOne({ user: req.user.id });
  if (!existing) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  if (existing.resumeUrl) {
    const oldPath = path.join(__dirname, "..", existing.resumeUrl);
    fs.unlink(oldPath, () => {});
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { resumeUrl },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  res.json({ resumeUrl: student.resumeUrl });
};
const addExperience = async (req, res) => {
  const { title, company, startDate, endDate, current, description } = req.body;

  if (!title || !company) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "title and company are required" });
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { $push: { experience: { title, company, startDate, endDate, current, description } } },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.status(HTTP_STATUS.CREATED).json(student);
};
const deleteExperience = async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { experience: { _id: req.params.experienceId } } },
    { new: true }
  ).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.json(student);
};
const addEducation = async (req, res) => {
  const { school, degree, year } = req.body;

  if (!school || !degree) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "school and degree are required" });
  }

  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { $push: { education: { school, degree, year } } },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.status(HTTP_STATUS.CREATED).json(student);
};
const deleteEducation = async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { education: { _id: req.params.educationId } } },
    { new: true }
  ).populate("user", "fullName email");

  if (!student) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
  }

  res.json(student);
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatarImage,
  uploadResumeFile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
};
