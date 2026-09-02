const path = require("path");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const MentorshipRequest = require("../models/MentorshipRequest");
const Student = require("../models/Student");
const Alumni = require("../models/Alumni");
const AppError = require("../errors/AppError");
const {
  HTTP_STATUS,
  MENTORSHIP_STATUS,
  ROLES,
  UPLOAD_DIRS,
} = require("../constants");
const { removeFileIfPresent } = require("../utils/fileStorage");

const ensureParticipant = async (conversationId, userId, message) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });
  if (!conversation) throw new AppError(message, HTTP_STATUS.FORBIDDEN);
  return conversation;
};

const getUnreadCount = async (userId) => {
  const ids = await Conversation.find({ participants: userId }).distinct("_id");
  return Message.countDocuments({
    conversation: { $in: ids },
    sender: { $ne: userId },
    seen: false,
  });
};

const markConversationRead = async ({ conversationId, userId }) => {
  await ensureParticipant(
    conversationId,
    userId,
    "Not authorized to view this conversation",
  );
  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: userId },
      seen: false,
    },
    { $set: { seen: true } },
  );
};

const getConversations = async (userId) => {
  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "fullName email role")
    .sort({ lastMessageAt: -1 });
  const participantIds = [...new Set(conversations.flatMap((conversation) =>
    conversation.participants.filter(Boolean).map(({ _id }) => _id.toString())))];
  const [studentProfiles, alumniProfiles] = await Promise.all([
    Student.find({ user: { $in: participantIds } }).select("user avatarUrl"),
    Alumni.find({ user: { $in: participantIds } }).select("user avatarUrl"),
  ]);
  const avatarByUserId = new Map();
  [...studentProfiles, ...alumniProfiles].forEach((profile) => {
    if (profile.avatarUrl) avatarByUserId.set(profile.user.toString(), profile.avatarUrl);
  });
  return conversations.map((conversation) => ({
    ...conversation.toObject(),
    participants: conversation.participants.filter(Boolean).map((participant) => ({
      ...participant.toObject(),
      avatarUrl: avatarByUserId.get(participant._id.toString()) || null,
    })),
  }));
};

const startConversation = async ({ otherUserId, user }) => {
  const studentUserId = user.role === ROLES.STUDENT ? user.id : otherUserId;
  const alumniUserId = user.role === ROLES.ALUMNI ? user.id : otherUserId;
  const acceptedRequest = await MentorshipRequest.findOne({
    student: studentUserId,
    alumni: alumniUserId,
    status: MENTORSHIP_STATUS.ACCEPTED,
  });
  if (!acceptedRequest) {
    throw new AppError(
      "You can only message an accepted mentor/mentee.",
      HTTP_STATUS.FORBIDDEN,
    );
  }
  const existing = await Conversation.findOne({
    participants: { $all: [user.id, otherUserId], $size: 2 },
  });
  return existing || Conversation.create({ participants: [user.id, otherUserId] });
};

const deleteConversation = async ({ conversationId, userId }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new AppError("Conversation not found", HTTP_STATUS.NOT_FOUND);
  if (!conversation.participants.some((participant) => participant.toString() === userId)) {
    throw new AppError("Not authorized to delete this chat", HTTP_STATUS.FORBIDDEN);
  }

  const attachments = await Message.find({
    conversation: conversationId,
    fileUrl: { $ne: null },
  }).select("fileUrl");
  await Message.deleteMany({ conversation: conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  const paths = attachments
    .map(({ fileUrl }) => path.join(UPLOAD_DIRS.CHAT, path.basename(fileUrl)))
    .filter((filePath, index, allPaths) => allPaths.indexOf(filePath) === index);
  const results = await Promise.allSettled(paths.map(removeFileIfPresent));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Failed to delete chat attachment ${paths[index]}:`, result.reason);
    }
  });
};

const getMessages = async ({ conversationId, userId }) => {
  await ensureParticipant(
    conversationId,
    userId,
    "Not authorized to view this conversation",
  );
  return Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
};

const sendMessage = async ({ conversationId, userId, text, file }) => {
  let messageSaved = false;
  try {
    await ensureParticipant(
      conversationId,
      userId,
      "Not authorized to send messages in this conversation",
    );
    const fileUrl = file ? `/uploads/chat/${file.filename}` : null;
    const fileType = file ? (file.mimetype.startsWith("image/") ? "image" : "file") : null;
    if (!text && !fileUrl) {
      throw new AppError("Message text or file is required", HTTP_STATUS.BAD_REQUEST);
    }
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text: text || "",
      fileUrl,
      fileType,
      fileName: file?.originalname || null,
    });
    messageSaved = true;
    const preview = text || (fileType === "image" ? "\u{1F4F7} Photo" : "\u{1F4CE} File");
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: preview,
      lastMessageAt: new Date(),
    });
    return message;
  } catch (error) {
    if (file?.path && !messageSaved) {
      try {
        await removeFileIfPresent(file.path);
      } catch (cleanupError) {
        console.error(`Failed to clean unsaved chat upload ${file.path}:`, cleanupError);
      }
    }
    throw error;
  }
};

module.exports = {
  deleteConversation,
  getConversations,
  getMessages,
  getUnreadCount,
  markConversationRead,
  sendMessage,
  startConversation,
};
