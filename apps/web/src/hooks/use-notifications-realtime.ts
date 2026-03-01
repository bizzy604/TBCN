'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store';
import type { NotificationItem, PaginatedNotifications } from '@/lib/api/notifications';
import { engagementKeys } from './use-engagement';

type NotificationReadPayload = {
  id: string;
  readAt: string | null;
};

type UnreadCountPayload = {
  unread: number;
};

export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    ).replace(/\/api\/v1$/, '');

    const socket = io(`${baseUrl}/notifications`, {
      transports: ['websocket'],
      auth: { token: accessToken },
    });

    socketRef.current = socket;

    socket.on('notification.new', (incoming: NotificationItem) => {
      queryClient.setQueriesData(
        { queryKey: ['notifications', 'mine'] },
        (old: PaginatedNotifications | undefined) => {
          if (!old) return old;

          const exists = old.data.some((item) => item.id === incoming.id);
          if (exists) {
            return old;
          }

          return {
            ...old,
            data: [incoming, ...old.data].slice(0, old.meta.limit),
            meta: {
              ...old.meta,
              total: old.meta.total + 1,
            },
          };
        },
      );

      queryClient.setQueryData(
        engagementKeys.notifications.unreadCount(),
        (old: UnreadCountPayload | undefined) => ({
          unread: (old?.unread ?? 0) + 1,
        }),
      );
    });

    socket.on('notification.read', (payload: NotificationReadPayload) => {
      queryClient.setQueriesData(
        { queryKey: ['notifications', 'mine'] },
        (old: PaginatedNotifications | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((item) =>
              item.id === payload.id
                ? { ...item, isRead: true, readAt: payload.readAt }
                : item,
            ),
          };
        },
      );
    });

    socket.on('notification.unread.count', (payload: UnreadCountPayload) => {
      queryClient.setQueryData(engagementKeys.notifications.unreadCount(), {
        unread: Math.max(0, Number(payload?.unread ?? 0)),
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, isAuthenticated, queryClient]);
}
