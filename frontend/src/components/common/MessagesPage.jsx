import { Link } from "react-router-dom";
import { getImageUrl as fileUrl } from "../../utils/getImageUrl";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import UserAvatar from "./UserAvatar";
import useMessagesPage from "./MessagesPage/useMessagesPage";

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

export default function MessagesPage() {
  const model = useMessagesPage();
  const {
    activeConvo, activeId, attachError, bottomRef, conversations, deleting,
    draft, fileInputRef, handleDeleteChat, handleFilePicked, handleKeyDown,
    handleSend, handleTyping, imageInputRef, loadingConvos, loadingMessages,
    menuOpen, menuRef, messages, otherPerson, setActiveId, setAttachError,
    setDraft, setMenuOpen, typing, uploading, user,
  } = model;

  return (
    <div className="flex h-[calc(100vh-105px)] bg-white rounded-2xl overflow-hidden">
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
            <EmptyState
              message="No conversations yet. Message an alumni from the Directory to start one."
              className="px-4"
            />
          ) : (
            conversations.map((conversation) => {
              const other = conversation.participants.find(
                (participant) => participant._id !== user._id,
              );
              return (
                <button
                  key={conversation._id}
                  onClick={() => setActiveId(conversation._id)}
                  className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors ${
                    activeId === conversation._id
                      ? "bg-blue-50 border-r-2 border-primary"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <UserAvatar
                    name={other?.fullName}
                    src={fileUrl(other?.avatarUrl)}
                    className="h-11 w-11"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark truncate">
                      {other?.fullName}
                    </p>
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

      {activeConvo ? (
        <div className="hidden sm:flex flex-1 flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={otherPerson?.fullName}
                src={fileUrl(otherPerson?.avatarUrl)}
                className="h-10 w-10"
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
                      {deleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
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
                  <div
                    key={chatMessage._id}
                    className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      {chatMessage.fileUrl &&
                        chatMessage.fileType === "image" && (
                          <Link
                            to={fileUrl(chatMessage.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={fileUrl(chatMessage.fileUrl)}
                              alt={chatMessage.fileName || "attachment"}
                              className="max-w-[220px] max-h-[220px] rounded-xl mb-1 object-cover border border-gray-100"
                            />
                          </Link>
                        )}
                      {chatMessage.fileUrl &&
                        chatMessage.fileType === "file" && (
                          <Link
                            to={fileUrl(chatMessage.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 text-sm max-w-[240px] ${
                              isMe
                                ? "bg-primary/10 text-primary"
                                : "bg-white border border-gray-100 text-dark"
                            }`}
                          >
                            <FileText size={16} className="shrink-0" />
                            <span className="truncate">
                              {chatMessage.fileName}
                            </span>
                          </Link>
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
                          {new Date(chatMessage.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {isMe &&
                          (chatMessage.seen ? (
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
                placeholder={
                  uploading ? "Uploading attachment..." : "Type your message..."
                }
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
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    Send <Send size={14} />
                  </>
                )}
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
