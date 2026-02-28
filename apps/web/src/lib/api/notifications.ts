import { api } from './client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  data: NotificationItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const notificationsApi = {
  listMine: (page = 1, limit = 20) =>
    api.getRaw<PaginatedNotifications>('/notifications', { params: { page, limit } }),

  markRead: (id: string) =>
    api.patch<NotificationItem>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<{ updated: number }>('/notifications/read-all'),
};

