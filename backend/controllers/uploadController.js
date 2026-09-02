const fs = require("fs");
const path = require("path");
const Alumni = require("../models/Alumni");
const Application = require("../models/Application");
const Conversation = require("../models/Conversation");
const Job = require("../models/Job");
const Message = require("../models/Message");
const Student = require("../models/Student");
const { HTTP_STATUS, ROLES, UPLOAD_DIRS } = require("../constants");

const requestedUploadUrl = (folder, filename) =>
  `/uploads/${folder}/${filename}`;

const sendUpload = (res, directory, filename) => {
  if (!filename || path.basename(filename) !== filename) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Invalid filename" });
  }

  const filePath = path.join(directory, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "File not found" });
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");
  return res.sendFile(filePath);
};

const getChatUpload = async (req, res) => {
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
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: "Not authorized to access this file",
    });
  }

  return sendUpload(res, UPLOAD_DIRS.CHAT, req.params.filename);
};

const getResumeUpload = async (req, res) => {
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
      }),
    );
  }

  if (!student && !alumni && !mayAccess) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "File not found" });
  }

  if (!mayAccess) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: "Not authorized to access this file",
    });
  }

  return sendUpload(res, UPLOAD_DIRS.RESUMES, req.params.filename);
};

module.exports = { getChatUpload, getResumeUpload };
