const { HTTP_STATUS } = require("../constants");
const messageService = require("../services/messageService");

const getUnreadMessageCount = async (req, res) => {
  res.json({ count: await messageService.getUnreadCount(req.user.id) });
};

const markConversationRead = async (req, res) => {
  await messageService.markConversationRead({
    conversationId: req.params.conversationId,
    userId: req.user.id,
  });
  res.json({ message: "Conversation marked as read" });
};

const getMyConversations = async (req, res) => {
  res.json(await messageService.getConversations(req.user.id));
};

const startConversation = async (req, res) => {
  res.json(await messageService.startConversation({
    otherUserId: req.body.otherUserId,
    user: req.user,
  }));
};

const deleteConversation = async (req, res) => {
  await messageService.deleteConversation({
    conversationId: req.params.conversationId,
    userId: req.user.id,
  });
  res.json({ message: "Conversation deleted" });
};

const getMessages = async (req, res) => {
  res.json(await messageService.getMessages({
    conversationId: req.params.conversationId,
    userId: req.user.id,
  }));
};

const sendMessage = async (req, res) => {
  const message = await messageService.sendMessage({
    conversationId: req.params.conversationId,
    userId: req.user.id,
    text: req.body.text,
    file: req.file,
  });
  res.status(HTTP_STATUS.CREATED).json(message);
};

module.exports = {
  deleteConversation,
  getMessages,
  getMyConversations,
  getUnreadMessageCount,
  markConversationRead,
  sendMessage,
  startConversation,
};
