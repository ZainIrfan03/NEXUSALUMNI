const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
  INTERVIEW_SCHEDULED: "interviewScheduled",
  INTERVIEW_RESPONSE_UPDATED: "interviewResponseUpdated",
};

const MESSAGE_MAX_LENGTH = 4000;

module.exports = { MESSAGE_MAX_LENGTH, SOCKET_EVENTS };
