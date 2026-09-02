const Alumni = require("../models/Alumni");
const User = require("../models/User");
const { HTTP_STATUS } = require("../constants");

// @route  GET /api/alumni/profile
// Returns the logged-in alumni's full profile (User + Alumni joined).
const getMyProfile = async (req, res) => {
  const alumni = await Alumni.findOne({ user: req.user.id }).populate(
    "user",
    "fullName email"
  );

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

// @route  PUT /api/alumni/profile
// @body   { fullName, location, headline, bio, skills, interests, isPublic,
//           company, jobTitle, openToMentorship }
// Updates fields split across User (fullName) and Alumni (everything else).
const updateMyProfile = async (req, res) => {
  const {
    fullName,
    location,
    headline,
    bio,
    skills,
    interests,
    isPublic,
    company,
    jobTitle,
    openToMentorship,
  } = req.body;

  // fullName lives on the base User document
  if (fullName) {
    await User.findByIdAndUpdate(req.user.id, { fullName });
  }

  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    {
      location,
      headline,
      bio,
      skills,
      interests,
      isPublic,
      company,
      jobTitle,
      openToMentorship,
    },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

// @route  POST /api/alumni/profile/experience
// @body   { title, company, startDate, endDate, current, description }
// Pushes a new experience entry — used by the "+ Add Role" button on the View page.
const addExperience = async (req, res) => {
  const { title, company, startDate, endDate, current, description } = req.body;

  if (!title || !company) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "title and company are required" });
  }

  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { $push: { experience: { title, company, startDate, endDate, current, description } } },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.status(HTTP_STATUS.CREATED).json(alumni);
};

// @route  DELETE /api/alumni/profile/experience/:experienceId
const deleteExperience = async (req, res) => {
  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { experience: { _id: req.params.experienceId } } },
    { new: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

// @route  POST /api/alumni/profile/education
// @body   { school, degree, year }
const addEducation = async (req, res) => {
  const { school, degree, year } = req.body;

  if (!school || !degree) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "school and degree are required" });
  }

  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { $push: { education: { school, degree, year } } },
    { new: true, runValidators: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.status(HTTP_STATUS.CREATED).json(alumni);
};

// @route  DELETE /api/alumni/profile/education/:educationId
const deleteEducation = async (req, res) => {
  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { education: { _id: req.params.educationId } } },
    { new: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

// @route  POST /api/alumni/profile/avatar
// @form   multipart/form-data, field name: "avatar"
// Requires the uploadAvatar middleware (multer) to run first, which
// attaches the saved file info to req.file.
const uploadAvatarImage = async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No file uploaded" });
  }

  // Avatars are intentionally public; resumes and chat files are protected.
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { avatarUrl },
    { new: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

// @route  POST /api/alumni/profile/resume
// @form   multipart/form-data, field name: "resume"
// Requires the uploadResume middleware (multer) to run first.
const uploadResumeFile = async (req, res) => {
  if (!req.file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No file uploaded" });
  }

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;

  const alumni = await Alumni.findOneAndUpdate(
    { user: req.user.id },
    { resumeUrl },
    { new: true }
  ).populate("user", "fullName email");

  if (!alumni) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Alumni profile not found" });
  }

  res.json(alumni);
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  uploadAvatarImage,
  uploadResumeFile,
};
