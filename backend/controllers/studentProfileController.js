const Student = require("../models/Student");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const { HTTP_STATUS } = require("../utils/constants");

// @route  GET /api/student/profile
// Returns the logged-in student's full profile (User + Student joined).
const getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate(
      "user",
      "fullName email"
    );

    if (!student) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  PUT /api/student/profile
// @body   { fullName, location, headline, bio, skills, interests, isPublic, resumeUrl, openToNetworking }
// Updates fields split across User (fullName) and Student (everything else).
const updateMyProfile = async (req, res) => {
  try {
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

    // fullName lives on the base User document
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
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/student/profile/avatar
// multipart/form-data, field name "avatar" (see uploadAvatar middleware)
// Saves the file path on the Student doc and deletes the old avatar file if one existed.
const uploadAvatarImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No image file uploaded." });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const existing = await Student.findOne({ user: req.user.id });
    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
    }

    // Clean up the previous avatar file, if any, so uploads/ doesn't fill up
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
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/student/profile/resume
// multipart/form-data, field name "resume" (see uploadResume middleware)
const uploadResumeFile = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/student/profile/experience
// @body   { title, company, startDate, endDate, current, description }
// Pushes a new experience entry — used by the "+ Add Role" button on the View page.
const addExperience = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/student/profile/experience/:experienceId
const deleteExperience = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { experience: { _id: req.params.experienceId } } },
      { new: true }
    ).populate("user", "fullName email");

    if (!student) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  POST /api/student/profile/education
// @body   { school, degree, year }
const addEducation = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

// @route  DELETE /api/student/profile/education/:educationId
const deleteEducation = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { education: { _id: req.params.educationId } } },
      { new: true }
    ).populate("user", "fullName email");

    if (!student) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Student profile not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(HTTP_STATUS.SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
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
