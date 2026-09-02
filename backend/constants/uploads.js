const path = require("path");

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const MAX_CHAT_FILE_SIZE = 10 * 1024 * 1024;

const UPLOAD_DIRS = {
  AVATARS: path.join(__dirname, "..", "uploads", "avatars"),
  RESUMES: path.join(__dirname, "..", "uploads", "resumes"),
  CHAT: path.join(__dirname, "..", "uploads", "chat"),
};

const AVATAR_UPLOAD_TYPES = {
  ".jpeg": ["image/jpeg"],
  ".jpg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

const CHAT_UPLOAD_TYPES = {
  ...AVATAR_UPLOAD_TYPES,
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
};

const RESUME_UPLOAD_TYPES = {
  ".pdf": ["application/pdf"],
};

const FILE_SIGNATURES = {
  DOC: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
  JPEG: [0xff, 0xd8, 0xff],
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  ZIP: [0x50, 0x4b],
  GIF_HEADERS: ["GIF87a", "GIF89a"],
  PDF_HEADER: "%PDF-",
  RIFF_HEADER: "RIFF",
  WEBP_HEADER: "WEBP",
  DOCX_CONTENT_TYPES_ENTRY: "[Content_Types].xml",
  DOCX_WORD_DIRECTORY: "word/",
};

const PROFILE_UPLOAD_CONFIG = {
  avatarUrl: {
    directory: UPLOAD_DIRS.AVATARS,
    folder: "avatars",
    missingFileMessage: "No image file uploaded",
  },
  resumeUrl: {
    directory: UPLOAD_DIRS.RESUMES,
    folder: "resumes",
    missingFileMessage: "No PDF file uploaded",
  },
};

module.exports = {
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
  MAX_CHAT_FILE_SIZE,
  UPLOAD_DIRS,
  AVATAR_UPLOAD_TYPES,
  CHAT_UPLOAD_TYPES,
  FILE_SIGNATURES,
  PROFILE_UPLOAD_CONFIG,
  RESUME_UPLOAD_TYPES,
};
