import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

/**
 * Messages API — covers:
 *   POST   /messages/conversations              (startConversation — used
 *          directly from Mentorship/Directory to jump into a chat)
 *   GET    /messages/conversations               (inbox list)
 *   GET    /messages/:conversationId              (message history)
 *   POST   /messages/:conversationId               (file/image attachment)
 *   DELETE /messages/conversations/:conversationId  (delete a whole chat)
 *
 * Live delivery (new text messages, typing indicator) still comes over
 * Socket.io, not REST — RTK Query has no notion of that, so Messages.jsx
 * patches the cache directly with `messagesApi.util.updateQueryData` when
 * a socket event arrives, instead of a "sendMessage" mutation here. File
 * attachments DO go over REST (multer), so those get a real mutation that
 * invalidates the conversation's message cache + the inbox list.
 */
export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startConversation: builder.mutation({
      query: (otherUserId) => ({
        url: "/messages/conversations",
        method: "POST",
        body: { otherUserId },
      }),
      invalidatesTags: [TAGS.CONVERSATIONS],
    }),

    getConversations: builder.query({
      query: () => "/messages/conversations",
      providesTags: [TAGS.CONVERSATIONS],
    }),

    getUnreadMessageCount: builder.query({
      query: () => "/messages/unread-count",
      providesTags: [TAGS.UNREAD_MESSAGES],
    }),

    markConversationRead: builder.mutation({
      query: (conversationId) => ({
        url: `/messages/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, conversationId) => [
        TAGS.UNREAD_MESSAGES,
        { type: TAGS.MESSAGES, id: conversationId },
      ],
    }),

    getMessages: builder.query({
      query: (conversationId) => `/messages/${conversationId}`,
      providesTags: (result, error, conversationId) => [{ type: TAGS.MESSAGES, id: conversationId }],
    }),

    sendFileMessage: builder.mutation({
      query: ({ conversationId, formData }) => ({
        url: `/messages/${conversationId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: TAGS.MESSAGES, id: conversationId },
        TAGS.CONVERSATIONS,
      ],
    }),

    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.CONVERSATIONS],
    }),
  }),
});

export const {
  useStartConversationMutation,
  useGetConversationsQuery,
  useGetUnreadMessageCountQuery,
  useMarkConversationReadMutation,
  useGetMessagesQuery,
  useSendFileMessageMutation,
  useDeleteConversationMutation,
} = messagesApi;
