const path = require("path");

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024;

const UPLOAD_DIRS = {
  AVATARS: path.join(__dirname, "..", "uploads", "avatars"),
  RESUMES: path.join(__dirname, "..", "uploads", "resumes"),
  CHAT: path.join(__dirname, "..", "uploads", "chat"),
};

module.exports = {
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
  MAX_CHAT_FILE_SIZE,
  UPLOAD_DIRS,
};
