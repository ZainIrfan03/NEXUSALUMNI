// middleware/uploadMiddleware.js
// Shared multer config for avatar (image), resume (PDF), and chat (image/file) uploads.
// Adjust the destination paths to match your project structure.

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  MAX_AVATAR_SIZE,
  MAX_RESUME_SIZE,
  MAX_CHAT_FILE_SIZE,
  UPLOAD_DIRS,
} = require("../constants");

// Make sure these folders exist (create them if they don't)
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---- Avatar storage (images only, 3MB limit) ----
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.AVATARS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const avatarFileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg", ".webp"];
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only real PNG, JPG, or WEBP image uploads are allowed."), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: MAX_AVATAR_SIZE },
});

// ---- Resume storage (PDF only, 5MB limit) ----
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.RESUMES),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."), false);
  }
};

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: MAX_RESUME_SIZE },
});

// ---- Chat storage (images + common docs, 10MB limit) ----
// Used in chat messages — accepts images (shown as inline preview on frontend)
// and documents like PDF/DOC/DOCX (shown as a downloadable attachment).
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.CHAT),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.id}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  },
});

const chatFileFilter = (req, file, cb) => {
  const allowed = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDF, or DOC/DOCX files are allowed."), false);
  }
};

const uploadChat = multer({
  storage: chatStorage,
  fileFilter: chatFileFilter,
  limits: { fileSize: MAX_CHAT_FILE_SIZE },
});

module.exports = { uploadAvatar, uploadResume, uploadChat };
