const Student = require("../models/Student");
const { HTTP_STATUS } = require("../constants");
const profileService = require("../services/profileService");
const { replaceProfileUpload } = require("../services/profileUploadService");

const profileContext = (userId) => ({
  ProfileModel: Student,
  profileName: "Student",
  userId,
});

const getMyProfile = async (req, res) => {
  res.json(await profileService.getProfile(profileContext(req.user.id)));
};

const updateMyProfile = async (req, res) => {
  const {
    fullName, location, headline, bio, skills, interests, isPublic,
    resumeUrl, openToNetworking,
  } = req.body;
  const profile = await profileService.updateProfile({
    ...profileContext(req.user.id),
    data: {
      fullName, location, headline, bio, skills, interests, isPublic,
      resumeUrl, openToNetworking,
    },
  });
  res.json(profile);
};

const uploadProfileFile = (field) => async (req, res) => {
  const url = await replaceProfileUpload({
    ...profileContext(req.user.id), file: req.file, field,
  });
  res.json({ [field]: url });
};

const addExperience = async (req, res) => {
  const profile = await profileService.addExperience({
    ...profileContext(req.user.id), data: req.body,
  });
  res.status(HTTP_STATUS.CREATED).json(profile);
};

const deleteExperience = async (req, res) => {
  res.json(await profileService.deleteExperience({
    ...profileContext(req.user.id), experienceId: req.params.experienceId,
  }));
};

const addEducation = async (req, res) => {
  const profile = await profileService.addEducation({
    ...profileContext(req.user.id), data: req.body,
  });
  res.status(HTTP_STATUS.CREATED).json(profile);
};

const deleteEducation = async (req, res) => {
  res.json(await profileService.deleteEducation({
    ...profileContext(req.user.id), educationId: req.params.educationId,
  }));
};

module.exports = {
  addEducation,
  addExperience,
  deleteEducation,
  deleteExperience,
  getMyProfile,
  updateMyProfile,
  uploadAvatarImage: uploadProfileFile("avatarUrl"),
  uploadResumeFile: uploadProfileFile("resumeUrl"),
};
