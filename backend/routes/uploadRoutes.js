const express = require("express");
const path = require("path");
const fs = require("fs");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { protect } = require("../middleware/authMiddleware");
const { HTTP_STATUS, UPLOAD_DIRS, ROLES } = require("../utils/constants");

const router = express.Router();

const requestedUploadUrl = (folder, filename) => `/uploads/${folder}/${filename}`;

const sendUpload = (res, directory, filename) => {
  if (!filename || path.basename(filename) !== filename) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Invalid filename" });
  }

  const filePath = path.join(directory, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "File not found" });
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");
  return res.sendFile(filePath);
};

// Only participants in the message's conversation can load its attachment.
router.get("/chat/:filename", protect, async (req, res, next) => {
  try {
    const fileUrl = requestedUploadUrl("chat", req.params.filename);
    const message = await Message.findOne({ fileUrl }).select("conversation");
    if (!message) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "File not found" });
    }

    const mayAccess = await Conversation.exists({
      _id: message.conversation,
      participants: req.user.id,
    });
    if (!mayAccess) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Not authorized to access this file" });
    }

    return sendUpload(res, UPLOAD_DIRS.CHAT, req.params.filename);
  } catch (error) {
    return next(error);
  }
});

// The resume owner can always download it. Alumni retain the existing ability
// to view resumes on public student profiles, and a job poster can download the
// exact resume snapshot attached to an application for their own job.
router.get("/resumes/:filename", protect, async (req, res, next) => {
  try {
    const resumeUrl = requestedUploadUrl("resumes", req.params.filename);
    const [student, alumni] = await Promise.all([
      Student.findOne({ resumeUrl }).select("user isPublic"),
      Alumni.findOne({ resumeUrl }).select("user"),
    ]);

    let mayAccess =
      student?.user.toString() === req.user.id ||
      alumni?.user.toString() === req.user.id;

    if (!mayAccess && req.user.role === ROLES.ALUMNI && student?.isPublic) {
      mayAccess = true;
    }

    if (!mayAccess && req.user.role === ROLES.ALUMNI) {
      const applications = await Application.find({ resumeUrl }).select("job");
      mayAccess = Boolean(
        await Job.exists({
          _id: { $in: applications.map((application) => application.job) },
          postedBy: req.user.id,
        })
      );
    }

    if (!student && !alumni && !mayAccess) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "File not found" });
    }
    if (!mayAccess) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Not authorized to access this file" });
    }

    return sendUpload(res, UPLOAD_DIRS.RESUMES, req.params.filename);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
