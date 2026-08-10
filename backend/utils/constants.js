// Central place for backend-wide constant values.
// Add more constants here as duplicates are found (see Word report).

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
};

const AUTH_COOKIE_NAME = "token";

module.exports = { HTTP_STATUS, SOCKET_EVENTS, AUTH_COOKIE_NAME };