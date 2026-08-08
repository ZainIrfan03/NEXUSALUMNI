import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getImageUrl as fileUrl } from "../../../utils/getImageUrl";
import LoadingSpinner from "../LoadingSpinner";
import EmptyState from "../EmptyState";
 import { SOCKET_URL, UI_AVATARS_BASE_URL, SOCKET_EVENTS } from "../../../consts/const"; 
import {
  messagesApi,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendFileMessageMutation,
  useDeleteConversationMutation,
} from "../../../store/api/messagesApi";


import {
  Search,
  SquarePen,
  Phone,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Check,
  CheckCheck,
  Loader2,
  Trash2,
  FileText,
  X,
} from "lucide-react";
import { connectSocket, getSocket } from "../../../utils/socket";

/**
 * Messages page — file: src/pages/dashboard/alumni/AlumniMessages.jsx
 * Real-time: REST (via RTK Query) loads history, Socket.io delivers live
 * messages. Inbox list + message history both live in the RTK Query
 * cache now — socket events patch that cache directly with
 * `messagesApi.util.updateQueryData` instead of local useState, so a
 * message that arrives while the user is on this page and one loaded
 * from a fresh page visit render through the exact same list.
 * Also supports image/file attachments (multer, via REST) and deleting
 * a whole conversation from the three-dot menu.
 */


// Real uploaded avatar when the person has one; otherwise a clean
// initials-based avatar instead of a fake stock photo.
const avatarSrc = (person) => {
  if (!person) return "";
  if (person.avatarUrl) return fileUrl(person.avatarUrl);
  return `${UI_AVATARS_BASE_URL}/?name=${encodeURIComponent( person.fullName || "User" )}
  &background=1E3A8A&color=fff&bold=true`;
};

export default function AlumniMessages() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const incomingConversationId = location.state?.conversationId;

  const { data: conversations = [], isLoading: loadingConvos } = useGetConversationsQuery();

  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachError, setAttachError] = useState("");
  const bottomRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const { data: messages = [], isLoading: loadingMessages } = useGetMessagesQuery(activeId, {
    skip: !activeId,
  });
  const [sendFileMessage, { isLoading: uploading }] = useSendFileMessageMutation();
  const [deleteConversationMutation] = useDeleteConversationMutation();

  const activeConvo = conversations.find((conversation) => conversation._id === activeId);
  const otherPerson = activeConvo?.participants.find((participant) => participant._id !== user._id);

  // Once the conversation list loads, jump into whichever chat we were
  // sent here for (e.g. "Message" button from Directory/Mentorship), or
  // the first one in the inbox.
  useEffect(() => {
    if (activeId || conversations.length === 0) return;
    setActiveId(incomingConversationId || conversations[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // 1. Connect socket once, on mount
  useEffect(() => {
    const socket = connectSocket();

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (msg) => {
      // Patch the cached message history for that conversation, if we've
      // fetched it before — if not, there's nothing to patch and the
      // next visit to that chat fetches it fresh from the backend anyway.
      dispatch(
        messagesApi.util.updateQueryData("getMessages", msg.conversation, (draftMessages) => {
          draftMessages.push(msg);
        })
      );
      // bump that conversation to the top of the inbox with the new preview
      dispatch(
        messagesApi.util.updateQueryData("getConversations", undefined, (draftConvos) => {
          const convo = draftConvos.find((c) => c._id === msg.conversation);
          if (convo) {
            convo.lastMessage = msg.text || (msg.fileName ? `📎 ${msg.fileName}` : "");
            convo.updatedAt = new Date().toISOString();
          }
          draftConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        })
      );
    });

    socket.on(SOCKET_EVENTS.MESSAGE_SENT, (msg) => {
      dispatch(
        messagesApi.util.updateQueryData("getMessages", msg.conversation, (draftMessages) => {
          draftMessages.push(msg);
        })
      );
    });

    socket.on(SOCKET_EVENTS.TYPING, ({ conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT);
      socket.off(SOCKET_EVENTS.TYPING);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref of activeId so the socket listeners above (set up once)
  // always know which conversation is currently open.
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Close the three-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !activeConvo || !otherPerson) return;
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      conversationId: activeId,
      text: draft,
      toUserId: otherPerson._id,
    });
    setDraft("");
  };

  const handleTyping = () => {
    if (!otherPerson) return;
    getSocket()?.emit(SOCKET_EVENTS.TYPING, { conversationId: activeId, toUserId: otherPerson._id });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ── Attachments (image/file upload via multer) ──────────────────────
  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again later
    if (!file || !activeConvo || !otherPerson) return;

    setAttachError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const message = await sendFileMessage({ conversationId: activeId, formData }).unwrap();

      // ...and relay it live to the other participant (attachments are
      // saved over REST, not the socket "sendMessage" event).
      getSocket()?.emit(SOCKET_EVENTS.FILE_MESSAGE_SENT, { message, toUserId: otherPerson._id });
    } catch (err) {
      setAttachError(err.data?.message || "Upload failed. Try a smaller file.");
    }
  };

  // ── Delete chat (three-dot menu) ─────────────────────────────────────
  const handleDeleteChat = async () => {
    if (!activeId) return;
    const confirmed = window.confirm(
      "Delete this entire conversation? This can't be undone."
    );
    if (!confirmed) return;

    setMenuOpen(false);
    setDeleting(true);
    try {
      await deleteConversationMutation(activeId).unwrap();
      const remaining = conversations.filter((conversation) => conversation._id !== activeId);
      setActiveId(remaining.length > 0 ? remaining[0]._id : null);
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Couldn't delete this conversation.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-105px)] bg-white rounded-2xl overflow-hidden">
      {/* Inbox list */}
      <div className="w-full sm:w-80 border-r border-gray-100 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-xl font-bold text-dark">Inbox</h1>
          <button className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
            <SquarePen size={15} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              placeholder="Search conversations..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <LoadingSpinner label="Loading..." className="py-10" />
          ) : conversations.length === 0 ? (
            <EmptyState message="No conversations yet. Message an alumni from the Directory to start one." className="px-4" />
          ) : (
            conversations.map((conversation) => {
              const other = conversation.participants.find((participant) => participant._id !== user._id);
              return (
                <button
                  key={conversation._id}
                  onClick={() => setActiveId(conversation._id)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                    activeId === conversation._id ? "bg-blue-50 border-r-2 border-primary" : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={avatarSrc(other)}
                    alt={other?.fullName}
                    className="h-11 w-11 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">{other?.fullName}</p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {conversation.lastMessage || "Say hello 👋"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      {activeConvo ? (
        <div className="hidden sm:flex flex-1 flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc(otherPerson)}
                alt={otherPerson?.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <p className="font-semibold text-dark">{otherPerson?.fullName}</p>
            </div>
            <div className="flex items-center gap-5">
              <button className="text-gray-400 hover:text-dark">
                <Phone size={18} />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((isOpen) => !isOpen)}
                  className="text-gray-400 hover:text-dark"
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10">
                    <button
                      onClick={handleDeleteChat}
                      disabled={deleting}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 bg-background">
            {loadingMessages ? (
              <LoadingSpinner label="Loading messages..." className="py-10" />
            ) : (
              messages.map((chatMessage) => {
                const isMe = chatMessage.sender === user._id;
                return (
                  <div key={chatMessage._id} className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {chatMessage.fileUrl && chatMessage.fileType === "image" && (
                        <a href={fileUrl(chatMessage.fileUrl)} target="_blank" rel="noopener noreferrer">
                          <img
                            src={fileUrl(chatMessage.fileUrl)}
                            alt={chatMessage.fileName || "attachment"}
                            className="max-w-[220px] max-h-[220px] rounded-xl mb-1 object-cover border border-gray-100"
                          />
                        </a>
                      )}
                      {chatMessage.fileUrl && chatMessage.fileType === "file" && (
                        <a
                          href={fileUrl(chatMessage.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 text-sm max-w-[240px] ${
                            isMe ? "bg-primary/10 text-primary" : "bg-white border border-gray-100 text-dark"
                          }`}
                        >
                          <FileText size={16} className="shrink-0" />
                          <span className="truncate">{chatMessage.fileName}</span>
                        </a>
                      )}
                      {chatMessage.text && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-white text-dark rounded-bl-sm border border-gray-100"
                          }`}
                        >
                          {chatMessage.text}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[11px] text-gray-400">
                          {new Date(chatMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (chatMessage.seen ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} className="text-gray-400" />)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {typing && (
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 w-fit">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {attachError && (
            <div className="flex items-center justify-between px-6 py-2 bg-red-50 text-red-600 text-xs">
              <span>{attachError}</span>
              <button onClick={() => setAttachError("")}>
                <X size={14} />
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                hidden
                onChange={handleFilePicked}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFilePicked}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-gray-400 hover:text-dark shrink-0 disabled:opacity-50"
                title="Attach a file"
              >
                <Paperclip size={18} />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                className="text-gray-400 hover:text-dark shrink-0 disabled:opacity-50"
                title="Attach an image"
              >
                <ImageIcon size={18} />
              </button>
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder={uploading ? "Uploading attachment..." : "Type your message..."}
                disabled={uploading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button className="text-gray-400 hover:text-dark shrink-0">
                <Smile size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={uploading}
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <>Send <Send size={14} /></>}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center text-gray-400 text-sm">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}