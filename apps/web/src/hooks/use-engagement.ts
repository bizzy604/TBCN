'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi, type CommunityQuery } from '@/lib/api/community';
import { messagesApi } from '@/lib/api/messages';
import { eventsApi, type EventQuery } from '@/lib/api/events';
import { notificationsApi } from '@/lib/api/notifications';

export const engagementKeys = {
  community: {
    posts: (params?: CommunityQuery) => ['community', 'posts', params] as const,
    post: (id: string) => ['community', 'post', id] as const,
    comments: (postId: string) => ['community', 'comments', postId] as const,
  },
  messages: {
    conversations: () => ['messages', 'conversations'] as const,
    thread: (peerId: string, page = 1, limit = 25) => ['messages', 'thread', peerId, page, limit] as const,
  },
  events: {
    list: (params?: EventQuery) => ['events', 'list', params] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    registrations: () => ['events', 'registrations', 'me'] as const,
    accessLink: (id: string) => ['events', 'access-link', id] as const,
  },
  notifications: {
    mine: (page = 1, limit = 20) => ['notifications', 'mine', page, limit] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },
};

export function useCommunityPosts(params?: CommunityQuery) {
  return useQuery({
    queryKey: engagementKeys.community.posts(params),
    queryFn: () => communityApi.listPosts(params),
  });
}

export function useCommunityComments(postId: string) {
  return useQuery({
    queryKey: engagementKeys.community.comments(postId),
    queryFn: () => communityApi.listComments(postId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communityApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string }) => communityApi.addComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.community.comments(postId) });
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

export function useTogglePostReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId }: { postId: string }) => communityApi.togglePostReaction(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useConversations() {
  return useQuery({
    queryKey: engagementKeys.messages.conversations(),
    queryFn: () => messagesApi.listConversations(),
  });
}

export function useMessageThread(peerId: string, page = 1, limit = 25) {
  return useQuery({
    queryKey: engagementKeys.messages.thread(peerId, page, limit),
    queryFn: () => messagesApi.getConversation(peerId, page, limit),
    enabled: !!peerId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: messagesApi.send,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.messages.conversations() });
      queryClient.invalidateQueries({ queryKey: ['messages', 'thread', payload.recipientId] });
    },
  });
}

export function useEvents(params?: EventQuery) {
  return useQuery({
    queryKey: engagementKeys.events.list(params),
    queryFn: () => eventsApi.list(params),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: engagementKeys.events.detail(id),
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.register(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: engagementKeys.events.registrations() });
      queryClient.invalidateQueries({ queryKey: engagementKeys.events.detail(id) });
      queryClient.invalidateQueries({ queryKey: engagementKeys.events.accessLink(id) });
    },
  });
}

export function useEventCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof eventsApi.checkout>[1];
    }) => eventsApi.checkout(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: engagementKeys.events.detail(variables.id) });
    },
  });
}

export function useEventAccessLink(id: string, enabled = true) {
  return useQuery({
    queryKey: engagementKeys.events.accessLink(id),
    queryFn: () => eventsApi.getAccessLink(id),
    enabled: !!id && enabled,
    retry: false,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof eventsApi.create>[0]) => eventsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useMyEventRegistrations() {
  return useQuery({
    queryKey: engagementKeys.events.registrations(),
    queryFn: () => eventsApi.myRegistrations(),
  });
}

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: engagementKeys.notifications.mine(page, limit),
    queryFn: () => notificationsApi.listMine(page, limit),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: engagementKeys.notifications.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: engagementKeys.notifications.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: engagementKeys.notifications.unreadCount() });
    },
  });
}

