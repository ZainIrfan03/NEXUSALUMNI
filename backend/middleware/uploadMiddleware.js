const fs = require("fs");
const multer = require("multer");
const path = require("path");
const {
  HTTP_STATUS,
  MAX_AVATAR_SIZE,
  MAX_CHAT_FILE_SIZE,
  MAX_RESUME_SIZE,
  UPLOAD_DIRS,
} = require("../constants");
const AppError = require("../errors/AppError");
const { removeFileIfPresent } = require("../utils/fileStorage");

Object.values(UPLOAD_DIRS).forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

const createStorage = (directory, includeRandomSuffix = false) =>
  multer.diskStorage({
    destination: (req, file, callback) => callback(null, directory),
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const randomSuffix = includeRandomSuffix
        ? `-${Math.round(Math.random() * 1e9)}`
        : "";
      callback(
        null,
        `${req.user.id}-${Date.now()}${randomSuffix}${extension}`,
      );
    },
  });

const avatarTypes = {
  ".jpeg": ["image/jpeg"],
  ".jpg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
};

const chatTypes = {
  ...avatarTypes,
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
  ".gif": ["image/gif"],
  ".pdf": ["application/pdf"],
};

const createFileFilter = (allowedTypes, message) =>
  (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const allowedMimeTypes = allowedTypes[extension];
    const isAllowed = allowedMimeTypes?.includes(file.mimetype);

    callback(isAllowed ? null : new Error(message), Boolean(isAllowed));
  };

const uploadAvatar = multer({
  storage: createStorage(UPLOAD_DIRS.AVATARS),
  fileFilter: createFileFilter(
    avatarTypes,
    "Only PNG, JPG, or WEBP image uploads are allowed.",
  ),
  limits: { fileSize: MAX_AVATAR_SIZE },
});

const uploadResume = multer({
  storage: createStorage(UPLOAD_DIRS.RESUMES),
  fileFilter: createFileFilter(
    { ".pdf": ["application/pdf"] },
    "Only PDF files are allowed.",
  ),
  limits: { fileSize: MAX_RESUME_SIZE },
});

const uploadChat = multer({
  storage: createStorage(UPLOAD_DIRS.CHAT, true),
  fileFilter: createFileFilter(
    chatTypes,
    "Only images, PDF, or DOC/DOCX files are allowed.",
  ),
  limits: { fileSize: MAX_CHAT_FILE_SIZE },
});

const startsWith = (buffer, bytes) =>
  bytes.every((byte, index) => buffer[index] === byte);

const hasValidSignature = (file, buffer) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if ([".jpg", ".jpeg"].includes(extension)) {
    return startsWith(buffer, [0xff, 0xd8, 0xff]);
  }
  if (extension === ".png") {
    return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
  if (extension === ".webp") {
    return buffer.subarray(0, 4).toString() === "RIFF" &&
      buffer.subarray(8, 12).toString() === "WEBP";
  }
  if (extension === ".gif") {
    return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  }
  if (extension === ".pdf") {
    return buffer.subarray(0, 5).toString() === "%PDF-";
  }
  if (extension === ".doc") {
    return startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }
  if (extension === ".docx") {
    const isZip = startsWith(buffer, [0x50, 0x4b]);
    return isZip &&
      buffer.includes(Buffer.from("[Content_Types].xml")) &&
      buffer.includes(Buffer.from("word/"));
  }

  return false;
};

const validateFileSignature = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    if (hasValidSignature(req.file, buffer)) return next();

    await removeFileIfPresent(req.file.path);
    req.file = undefined;
    return next(
      new AppError(
        "File content does not match its extension",
        HTTP_STATUS.BAD_REQUEST,
      ),
    );
  } catch (error) {
    await removeFileIfPresent(req.file?.path);
    req.file = undefined;
    return next(error);
  }
};

module.exports = {
  uploadAvatar,
  uploadChat,
  uploadResume,
  validateFileSignature,
};
