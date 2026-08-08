 export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
 export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

 export const UI_AVATARS_BASE_URL = "https://ui-avatars.com/api"; 
 export const PRAVATAR_BASE_URL = "https://i.pravatar.cc/150";
 
// Must exactly match BACKEND/utils/constants.js -> SOCKET_EVENTS
export const SOCKET_EVENTS = {
  TYPING: "typing",
  SEND_MESSAGE: "sendMessage",
  MESSAGE_SENT: "messageSent",
  RECEIVE_MESSAGE: "receiveMessage",
  MESSAGE_ERROR: "messageError",
  FILE_MESSAGE_SENT: "fileMessageSent",
};