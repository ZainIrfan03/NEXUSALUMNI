const Student = require("../models/Student");
const User = require("../models/User");
const { HTTP_STATUS } = require("../constants");
const { replaceProfileUpload } = require("../services/profileUploadService");
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
  const avatarUrl = await replaceProfileUpload({
    ProfileModel: Student,
    userId: req.user.id,
    file: req.file,
    field: "avatarUrl",
    profileName: "Student",
  });

  res.json({ avatarUrl });
};
const uploadResumeFile = async (req, res) => {
  const resumeUrl = await replaceProfileUpload({
    ProfileModel: Student,
    userId: req.user.id,
    file: req.file,
    field: "resumeUrl",
    profileName: "Student",
  });

  res.json({ resumeUrl });
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
