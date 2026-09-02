const fs = require("fs");
const multer = require("multer");
const path = require("path");
const {
  AVATAR_UPLOAD_TYPES,
  CHAT_UPLOAD_TYPES,
  FILE_SIGNATURES,
  HTTP_STATUS,
  MAX_AVATAR_SIZE,
  MAX_CHAT_FILE_SIZE,
  MAX_RESUME_SIZE,
  RESUME_UPLOAD_TYPES,
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
    AVATAR_UPLOAD_TYPES,
    "Only PNG, JPG, or WEBP image uploads are allowed.",
  ),
  limits: { fileSize: MAX_AVATAR_SIZE },
});

const uploadResume = multer({
  storage: createStorage(UPLOAD_DIRS.RESUMES),
  fileFilter: createFileFilter(
    RESUME_UPLOAD_TYPES,
    "Only PDF files are allowed.",
  ),
  limits: { fileSize: MAX_RESUME_SIZE },
});

const uploadChat = multer({
  storage: createStorage(UPLOAD_DIRS.CHAT, true),
  fileFilter: createFileFilter(
    CHAT_UPLOAD_TYPES,
    "Only images, PDF, or DOC/DOCX files are allowed.",
  ),
  limits: { fileSize: MAX_CHAT_FILE_SIZE },
});

const startsWith = (buffer, bytes) =>
  bytes.every((byte, index) => buffer[index] === byte);

const hasValidSignature = (file, buffer) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if ([".jpg", ".jpeg"].includes(extension)) {
    return startsWith(buffer, FILE_SIGNATURES.JPEG);
  }
  if (extension === ".png") {
    return startsWith(buffer, FILE_SIGNATURES.PNG);
  }
  if (extension === ".webp") {
    return buffer.subarray(0, 4).toString() === FILE_SIGNATURES.RIFF_HEADER &&
      buffer.subarray(8, 12).toString() === FILE_SIGNATURES.WEBP_HEADER;
  }
  if (extension === ".gif") {
    return FILE_SIGNATURES.GIF_HEADERS.includes(buffer.subarray(0, 6).toString());
  }
  if (extension === ".pdf") {
    return buffer.subarray(0, 5).toString() === FILE_SIGNATURES.PDF_HEADER;
  }
  if (extension === ".doc") {
    return startsWith(buffer, FILE_SIGNATURES.DOC);
  }
  if (extension === ".docx") {
    const isZip = startsWith(buffer, FILE_SIGNATURES.ZIP);
    return isZip &&
      buffer.includes(Buffer.from(FILE_SIGNATURES.DOCX_CONTENT_TYPES_ENTRY)) &&
      buffer.includes(Buffer.from(FILE_SIGNATURES.DOCX_WORD_DIRECTORY));
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
