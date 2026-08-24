import { baseApi } from "./baseApi";
import { TAGS } from "../../consts/appConstants";

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
      providesTags: (result, error, conversationId) => [
        { type: TAGS.MESSAGES, id: conversationId },
      ],
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
