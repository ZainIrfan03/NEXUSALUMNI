import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { SOCKET_EVENTS, TYPING_TIMEOUT_MS } from "../../../consts/appConstants";
import {
  messagesApi,
  useDeleteConversationMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  useSendFileMessageMutation,
} from "../../../store/api/messagesApi";
import { connectSocket, getSocket } from "../../../utils/socket";

export default function useMessagesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const incomingConversationId = useLocation().state?.conversationId;
  const { data: conversations = [], isLoading: loadingConvos } =
    useGetConversationsQuery(undefined, { refetchOnMountOrArgChange: true });
  const [selectedConversationId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachError, setAttachError] = useState("");
  const bottomRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const activeId = conversations.some(({ _id }) => _id === selectedConversationId)
    ? selectedConversationId
    : conversations.some(({ _id }) => _id === incomingConversationId)
      ? incomingConversationId
      : conversations[0]?._id || null;
  const activeIdRef = useRef(activeId);
  const { data: messages = [], isLoading: loadingMessages } =
    useGetMessagesQuery(activeId, { skip: !activeId });
  const [sendFileMessage, { isLoading: uploading }] = useSendFileMessageMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const [markConversationRead] = useMarkConversationReadMutation();
  const activeConvo = conversations.find(({ _id }) => _id === activeId);
  const otherPerson = activeConvo?.participants.find(({ _id }) => _id !== user._id);

  useEffect(() => {
    if (!activeId) return;
    markConversationRead(activeId).unwrap().catch(() => {});
  }, [activeId, markConversationRead]);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => {
    const socket = connectSocket();
    const addMessage = (message) => {
      dispatch(messagesApi.util.updateQueryData(
        "getMessages", message.conversation,
        (draftMessages) => { draftMessages.push(message); },
      ));
    };
    const handleReceiveMessage = (message) => {
      addMessage(message);
      dispatch(messagesApi.util.updateQueryData(
        "getConversations", undefined,
        (draftConversations) => {
          const conversation = draftConversations.find(
            ({ _id }) => _id === message.conversation,
          );
          if (conversation) {
            conversation.lastMessage =
              message.text || (message.fileName ? `📎 ${message.fileName}` : "");
            conversation.updatedAt = new Date().toISOString();
          }
          draftConversations.sort(
            (first, second) => new Date(second.updatedAt) - new Date(first.updatedAt),
          );
        },
      ));
      if (message.conversation === activeIdRef.current) {
        markConversationRead(message.conversation).unwrap().catch(() => {});
      }
    };
    const handleTypingEvent = ({ conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setTyping(true);
        setTimeout(() => setTyping(false), TYPING_TIMEOUT_MS);
      }
    };
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_SENT, addMessage);
    socket.on(SOCKET_EVENTS.TYPING, handleTypingEvent);
    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_SENT, addMessage);
      socket.off(SOCKET_EVENTS.TYPING, handleTypingEvent);
    };
  }, [dispatch, markConversationRead]);
  useEffect(() => {
    const closeMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim() || !activeConvo || !otherPerson) return;
    getSocket().emit(SOCKET_EVENTS.SEND_MESSAGE, {
      conversationId: activeId,
      text: draft,
    });
    setDraft("");
  };
  const handleTyping = () => {
    if (otherPerson) getSocket()?.emit(SOCKET_EVENTS.TYPING, { conversationId: activeId });
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !activeConvo || !otherPerson) return;
    setAttachError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const message = await sendFileMessage({ conversationId: activeId, formData }).unwrap();
      getSocket()?.emit(SOCKET_EVENTS.FILE_MESSAGE_SENT, { messageId: message._id });
    } catch (requestError) {
      setAttachError(requestError.data?.message || "Upload failed. Try a smaller file.");
    }
  };
  const handleDeleteChat = async () => {
    if (!activeId || !window.confirm("Delete this entire conversation? This can't be undone.")) return;
    setMenuOpen(false); setDeleting(true);
    try {
      await deleteConversation(activeId).unwrap();
      const remaining = conversations.filter(({ _id }) => _id !== activeId);
      setActiveId(remaining[0]?._id || null);
    } catch (requestError) {
      window.alert(requestError.data?.message || "Couldn't delete this conversation.");
    } finally { setDeleting(false); }
  };

  return {
    activeConvo, activeId, attachError, bottomRef, conversations, deleting,
    draft, fileInputRef, handleDeleteChat, handleFilePicked, handleKeyDown,
    handleSend, handleTyping, imageInputRef, loadingConvos, loadingMessages,
    menuOpen, menuRef, messages, otherPerson, setActiveId, setAttachError,
    setDraft, setMenuOpen, typing, uploading, user,
  };
}
