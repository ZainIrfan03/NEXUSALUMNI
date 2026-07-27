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
} from "lucide-react";
import { connectSocket, getSocket } from "../../../utils/socket";

/**
 * Messages page — file: src/pages/dashboard/alumni/Messages.jsx
 * Identical to the student version — the chat UI is role-agnostic,
 * it just shows whoever the other participant in the conversation is.
 */

const getToken = () => JSON.parse(localStorage.getItem("user"))?.token;
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function AlumniMessages() {
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const activeConvo = conversations.find((c) => c._id === activeId);
  const otherPerson = activeConvo?.participants.find((p) => p._id !== user._id);

  // 1. Connect socket once, on mount
  useEffect(() => {
    const socket = connectSocket(getToken());

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => (msg.conversation === activeIdRef.current ? [...prev, msg] : prev));
      // bump that conversation to the top of the inbox with the new preview
      setConversations((prev) =>
        prev
          .map((c) => (c._id === msg.conversation ? { ...c, lastMessage: msg.text } : c))
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

  // 2. Load the conversation list on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/messages/conversations",
          authHeader()
        );
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
        const { data } = await axios.get(
          `http://localhost:5000/api/messages/${activeId}`,
          authHeader()
        );
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
                    src={`https://i.pravatar.cc/150?u=${other?._id}`}
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
                src={`https://i.pravatar.cc/150?u=${otherPerson?._id}`}
                alt={otherPerson?.fullName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <p className="font-semibold text-dark">{otherPerson?.fullName}</p>
            </div>
            <div className="flex items-center gap-5">
              <button className="text-gray-400 hover:text-dark">
                <Phone size={18} />
              </button>
              <button className="text-gray-400 hover:text-dark">
                <MoreVertical size={18} />
              </button>
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
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white text-dark rounded-bl-sm border border-gray-100"
                        }`}
                      >
                        {m.text}
                      </div>
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

          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2.5">
              <button className="text-gray-400 hover:text-dark shrink-0">
                <Paperclip size={18} />
              </button>
              <button className="text-gray-400 hover:text-dark shrink-0">
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
                className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl shrink-0 hover:opacity-90 transition-opacity"
              >
                Send <Send size={14} />
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