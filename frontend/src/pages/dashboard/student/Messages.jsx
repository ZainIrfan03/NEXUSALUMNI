import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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
 * Messages page — file: src/pages/dashboard/student/Messages.jsx
 * Now real-time: REST loads history, Socket.io delivers live messages.
 * Also supports image/file attachments (multer, via REST) and deleting
 * a whole conversation from the three-dot menu.
 */

const API_BASE = API_BASE_URL;


// Files come back from the backend as relative paths (e.g. "/uploads/chat/xyz.png"),
// so build a full URL for <img src> / <a href>.
const fileUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("blob:") || p.startsWith("http")) return p;
  return `SOCKET_URL${p}`;
};

// Real uploaded avatar when the person has one; otherwise a clean
// initials-based avatar instead of a fake stock photo.
const avatarSrc = (person) => {
  if (!person) return "";
  if (person.avatarUrl) return fileUrl(person.avatarUrl);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    person.fullName || "User"
  )}&background=1E3A8A&color=fff&bold=true`;
};

export default function Messages() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const incomingConversationId = location.state?.conversationId;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachError, setAttachError] = useState("");
  const bottomRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const activeConvo = conversations.find((c) => c._id === activeId);
  const otherPerson = activeConvo?.participants.find((p) => p._id !== user._id);

  // 1. Connect socket once, on mount
  useEffect(() => {
    const socket = connectSocket();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => (msg.conversation === activeIdRef.current ? [...prev, msg] : prev));
      // bump that conversation to the top of the inbox with the new preview
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text || (msg.fileName ? `📎 ${msg.fileName}` : "") }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("messageSent", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageSent");
      socket.off("typing");
    };
  }, []);

  // Keep a ref of activeId so the socket listeners above (set up once)
  // always know which conversation is currently open.
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Close the three-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Load the conversation list on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/messages/conversations`);
        setConversations(data);
        if (incomingConversationId) {
          setActiveId(incomingConversationId);
        } else if (data.length > 0) {
          setActiveId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConvos(false);
      }
    };
    fetchConversations();
  }, []);

  // 3. Load message history whenever the active conversation changes
  useEffect(() => {
    if (!activeId) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await axios.get(`${API_BASE}/messages/${activeId}`);
        setMessages(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeId]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !activeConvo || !otherPerson) return;
    const socket = getSocket();
    socket.emit("sendMessage", {
      conversationId: activeId,
      text: draft,
      toUserId: otherPerson._id,
    });
    setDraft("");
  };

  const handleTyping = () => {
    if (!otherPerson) return;
    getSocket()?.emit("typing", { conversationId: activeId, toUserId: otherPerson._id });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Attachments (image/file upload via multer) ──────────────────────
  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file || !activeConvo || !otherPerson) return;

    setAttachError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data: message } = await axios.post(
        `${API_BASE}/messages/${activeId}`,
        formData
      );

      // Reflect it in our own chat window immediately...
      setMessages((prev) => [...prev, message]);
      // ...and relay it live to the other participant (attachments are
      // saved over REST, not the socket "sendMessage" event).
      getSocket()?.emit("fileMessageSent", { message, toUserId: otherPerson._id });

      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === activeId ? { ...c, lastMessage: `📎 ${message.fileName}` } : c
          )
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      );
    } catch (err) {
      setAttachError(err.response?.data?.message || "Upload failed. Try a smaller file.");
    } finally {
      setUploading(false);
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
      await axios.delete(`${API_BASE}/messages/conversations/${activeId}`);
      setConversations((prev) => {
        const remaining = prev.filter((c) => c._id !== activeId);
        setActiveId(remaining.length > 0 ? remaining[0]._id : null);
        return remaining;
      });
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Couldn't delete this conversation.");
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
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 px-4">
              No conversations yet. Message an alumni from the Directory to start one.
            </p>
          ) : (
            conversations.map((c) => {
              const other = c.participants.find((p) => p._id !== user._id);
              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                    activeId === c._id ? "bg-blue-50 border-r-2 border-primary" : "hover:bg-gray-50"
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
                      {c.lastMessage || "Say hello 👋"}
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
                  onClick={() => setMenuOpen((v) => !v)}
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
              <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" /> Loading messages...
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === user._id;
                return (
                  <div key={m._id} className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {m.fileUrl && m.fileType === "image" && (
                        <a href={fileUrl(m.fileUrl)} target="_blank" rel="noopener noreferrer">
                          <img
                            src={fileUrl(m.fileUrl)}
                            alt={m.fileName || "attachment"}
                            className="max-w-[220px] max-h-[220px] rounded-xl mb-1 object-cover border border-gray-100"
                          />
                        </a>
                      )}
                      {m.fileUrl && m.fileType === "file" && (
                        <a
                          href={fileUrl(m.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 text-sm max-w-[240px] ${
                            isMe ? "bg-primary/10 text-primary" : "bg-white border border-gray-100 text-dark"
                          }`}
                        >
                          <FileText size={16} className="shrink-0" />
                          <span className="truncate">{m.fileName}</span>
                        </a>
                      )}
                      {m.text && (
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-white text-dark rounded-bl-sm border border-gray-100"
                          }`}
                        >
                          {m.text}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[11px] text-gray-400">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (m.seen ? <CheckCheck size={12} className="text-primary" /> : <Check size={12} className="text-gray-400" />)}
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
                onChange={(e) => {
                  setDraft(e.target.value);
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