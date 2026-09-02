const User = require("../models/User");
const AppError = require("../errors/AppError");
const { HTTP_STATUS } = require("../constants");

const ensureProfile = (profile, profileName) => {
  if (!profile) {
    throw new AppError(`${profileName} profile not found`, HTTP_STATUS.NOT_FOUND);
  }
  return profile;
};

const getProfile = async ({ ProfileModel, profileName, userId }) => {
  const profile = await ProfileModel.findOne({ user: userId }).populate(
    "user",
    "fullName email",
  );
  return ensureProfile(profile, profileName);
};

const updateProfile = async ({ ProfileModel, profileName, userId, data }) => {
  const { fullName, ...profileData } = data;
  if (fullName) await User.findByIdAndUpdate(userId, { fullName });

  const profile = await ProfileModel.findOneAndUpdate(
    { user: userId },
    profileData,
    { returnDocument: "after", runValidators: true },
  ).populate("user", "fullName email");
  return ensureProfile(profile, profileName);
};

const addExperience = async ({ ProfileModel, profileName, userId, data }) => {
  if (!data.title || !data.company) {
    throw new AppError("title and company are required", HTTP_STATUS.BAD_REQUEST);
  }
  const { title, company, startDate, endDate, current, description } = data;

  const profile = await ProfileModel.findOneAndUpdate(
    { user: userId },
    { $push: { experience: { title, company, startDate, endDate, current, description } } },
    { returnDocument: "after", runValidators: true },
  ).populate("user", "fullName email");
  return ensureProfile(profile, profileName);
};

const deleteExperience = async ({ ProfileModel, profileName, userId, experienceId }) => {
  const profile = await ProfileModel.findOneAndUpdate(
    { user: userId },
    { $pull: { experience: { _id: experienceId } } },
    { returnDocument: "after" },
  ).populate("user", "fullName email");
  return ensureProfile(profile, profileName);
};

const addEducation = async ({ ProfileModel, profileName, userId, data }) => {
  if (!data.school || !data.degree) {
    throw new AppError("school and degree are required", HTTP_STATUS.BAD_REQUEST);
  }
  const { school, degree, year } = data;

  const profile = await ProfileModel.findOneAndUpdate(
    { user: userId },
    { $push: { education: { school, degree, year } } },
    { returnDocument: "after", runValidators: true },
  ).populate("user", "fullName email");
  return ensureProfile(profile, profileName);
};

const deleteEducation = async ({ ProfileModel, profileName, userId, educationId }) => {
  const profile = await ProfileModel.findOneAndUpdate(
    { user: userId },
    { $pull: { education: { _id: educationId } } },
    { returnDocument: "after" },
  ).populate("user", "fullName email");
  return ensureProfile(profile, profileName);
};

module.exports = {
  addEducation,
  addExperience,
  deleteEducation,
  deleteExperience,
  getProfile,
  updateProfile,
};
