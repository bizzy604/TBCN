import { api } from './client';

export type MessageThreadRole = 'sender' | 'recipient';

export interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  readAt: string | null;
  sender?: MessageUser;
  recipient?: MessageUser;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  peerId: string;
  peer: MessageUser;
  lastMessage: DirectMessage;
  unreadCount: number;
}

export interface PaginatedMessages {
  data: DirectMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const messagesApi = {
  listConversations: () =>
    api.get<ConversationSummary[]>('/messages/conversations'),

  getConversation: (peerId: string, page = 1, limit = 25) =>
    api.getRaw<PaginatedMessages>(`/messages/conversations/${peerId}`, { params: { page, limit } }),

  send: (payload: { recipientId: string; content: string }) =>
    api.post<DirectMessage>('/messages', payload),

  markRead: (id: string) =>
    api.patch<DirectMessage>(`/messages/${id}/read`),
};

