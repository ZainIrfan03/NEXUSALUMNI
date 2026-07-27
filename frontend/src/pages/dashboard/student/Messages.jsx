import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
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
  X,
  FileText,
  Trash2,
} from "lucide-react";
import { connectSocket, getSocket } from "../../../utils/socket";

/**
 * Messages page — file: src/pages/dashboard/alumni/Messages.jsx
 * Identical to the student version — the chat UI is role-agnostic,
 * it just shows whoever the other participant in the conversation is.
 */

const API_BASE = "http://localhost:5000";

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// Resolves a stored path (e.g. "/uploads/avatars/xxx.png") or a full URL into
// something an <img> tag can use directly.
const resolveUrl = (path) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
};

// Avatar with graceful fallback to initials when the user has no profileImage.
function Avatar({ user, size = 40 }) {
  const src = resolveUrl(user?.profileImage);
  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={user?.fullName}
        style={{ height: size, width: size }}
        className="rounded-full object-cover shrink-0"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      style={{ height: size, width: size }}
      className="rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0"
    >
      {initials || "?"}
    </div>
  );
}

export default function AlumniMessages() {
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // object URL for image preview
  const [menuOpen, setMenuOpen] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null); // any file (Paperclip)
  const imageInputRef = useRef(null); // images only (ImageIcon)
  const menuRef = useRef(null);

  const activeConvo = conversations.find((c) => c._id === activeId);
  const otherPerson = activeConvo?.participants.find((p) => p._id !== user._id);

  // 1. Connect socket once, on mount
  useEffect(() => {
    const socket = connectSocket(getToken());

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => (msg.conversation === activeIdRef.current ? [...prev, msg] : prev));
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === msg.conversation
              ? { ...c, lastMessage: msg.text || (msg.fileType === "image" ? "📷 Photo" : "📎 File") }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("typing", ({ conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    // Fired when the other participant deletes the conversation.
    socket.on("conversationDeleted", ({ conversationId }) => {
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (activeIdRef.current === conversationId) {
        setActiveId(null);
        setMessages([]);
      }
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("conversationDeleted");
    };
  }, []);

  // Keep a ref of activeId so the socket listeners above (set up once)
  // always know which conversation is currently open.
  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Close the three-dots menu on outside click
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
        const { data } = await axios.get(`${API_BASE}/api/messages/conversations`, authHeader());
        setConversations(data);
        if (data.length > 0) setActiveId(data[0]._id);
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
        const { data } = await axios.get(`${API_BASE}/api/messages/${activeId}`, authHeader());
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

  // Clean up the object URL used for image previews
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handlePickFile = (e, isImage) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isImage && !file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setFilePreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  // Sends via the REST endpoint (multer handles the optional file), then
  // notifies the other participant live over the socket with the saved message.
  const handleSend = async () => {
    if ((!draft.trim() && !selectedFile) || !activeConvo || !otherPerson || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", draft.trim());
      if (selectedFile) formData.append("file", selectedFile);

      const { data: savedMessage } = await axios.post(
        `${API_BASE}/api/messages/${activeId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessages((prev) => [...prev, savedMessage]);
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === activeId
              ? {
                  ...c,
                  lastMessage:
                    savedMessage.text || (savedMessage.fileType === "image" ? "📷 Photo" : "📎 File"),
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      // Push it live to the other participant. Requires a matching listener
      // in server.js, e.g.:
      //   socket.on("notifyMessage", ({ toUserId, message }) => {
      //     io.to(toUserId).emit("receiveMessage", message);
      //   });
      getSocket()?.emit("notifyMessage", { toUserId: otherPerson._id, message: savedMessage });

      setDraft("");
      clearSelectedFile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
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

  const handleDeleteChat = async () => {
    if (!activeId) return;
    const confirmed = window.confirm("Delete this chat permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/api/messages/conversations/${activeId}`, authHeader());

      // let the other participant know their side should drop it too
      if (otherPerson) {
        getSocket()?.emit("deleteConversation", {
          toUserId: otherPerson._id,
          conversationId: activeId,
        });
      }

      setConversations((prev) => prev.filter((c) => c._id !== activeId));
      setMessages([]);
      setActiveId(null);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete conversation.");
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
                  <Avatar user={other} size={44} />
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
              <Avatar user={otherPerson} size={40} />
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
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 shadow-lg rounded-xl py-1.5 z-10">
                    <button
                      onClick={handleDeleteChat}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete Chat
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
                        <a href={resolveUrl(m.fileUrl)} target="_blank" rel="noreferrer">
                          <img
                            src={resolveUrl(m.fileUrl)}
                            alt={m.fileName || "attachment"}
                            className="max-w-[240px] rounded-xl border border-gray-100 mb-1"
                          />
                        </a>
                      )}

                      {m.fileUrl && m.fileType === "file" && (
                        <a
                          href={resolveUrl(m.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-1 text-sm ${
                            isMe ? "bg-primary/5 border-primary/20 text-primary" : "bg-gray-50 border-gray-200 text-dark"
                          }`}
                        >
                          <FileText size={16} />
                          <span className="truncate max-w-[160px]">{m.fileName || "Attachment"}</span>
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
                        {isMe &&
                          (m.seen ? (
                            <CheckCheck size={12} className="text-primary" />
                          ) : (
                            <Check size={12} className="text-gray-400" />
                          ))}
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

          <div className="border-t border-gray-100 px-6 py-4">
            {/* Selected file / image preview, shown above the input before sending */}
            {selectedFile && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 mb-2">
                {filePreview ? (
                  <img src={filePreview} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <FileText size={18} className="text-gray-500" />
                  </div>
                )}
                <span className="flex-1 text-sm text-gray-600 truncate">{selectedFile.name}</span>
                <button onClick={clearSelectedFile} className="text-gray-400 hover:text-red-500">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2.5">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif"
                onChange={(e) => handlePickFile(e, false)}
              />
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handlePickFile(e, true)}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-dark shrink-0"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="text-gray-400 hover:text-dark shrink-0"
                title="Attach image"
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
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button className="text-gray-400 hover:text-dark shrink-0">
                <Smile size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={sending || (!draft.trim() && !selectedFile)}
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send
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