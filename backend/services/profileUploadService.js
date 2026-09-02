const AppError = require("../errors/AppError");
const { HTTP_STATUS, PROFILE_UPLOAD_CONFIG } = require("../constants");
const { removeFileIfPresent, removeStoredUpload } = require("../utils/fileStorage");

const replaceProfileUpload = async ({
  ProfileModel,
  userId,
  file,
  field,
  profileName,
}) => {
  const config = PROFILE_UPLOAD_CONFIG[field];
  if (!file) {
    throw new AppError(config.missingFileMessage, HTTP_STATUS.BAD_REQUEST);
  }

  const profile = await ProfileModel.findOne({ user: userId }).select(field);
  if (!profile) {
    await removeFileIfPresent(file.path);
    throw new AppError(`${profileName} profile not found`, HTTP_STATUS.NOT_FOUND);
  }

  const oldFileUrl = profile[field];
  const newFileUrl = `/uploads/${config.folder}/${file.filename}`;

  try {
    profile[field] = newFileUrl;
    await profile.save();
  } catch (error) {
    await removeFileIfPresent(file.path);
    throw error;
  }

  try {
    await removeStoredUpload(oldFileUrl, config.directory);
  } catch (error) {
    console.error(`Failed to remove replaced ${field}:`, error);
  }

  return newFileUrl;
};

module.exports = { replaceProfileUpload };
