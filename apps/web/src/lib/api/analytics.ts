import { api } from './client';

export interface AdminOverviewMetrics {
  usersTotal: number;
  usersActive: number;
  programsTotal: number;
  programsPublished: number;
  enrollmentsTotal: number;
  communityPostsTotal: number;
  eventsTotal: number;
  transactionsTotal: number;
  revenueTotal: number;
  conversionRate: number;
}

export interface AdminActivityItem {
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export const analyticsApi = {
  getAdminOverview: (params?: { from?: string; to?: string }) =>
    api.get<AdminOverviewMetrics>('/analytics/admin/overview', { params }),

  getAdminActivity: (limit = 12) =>
    api.get<AdminActivityItem[]>('/analytics/admin/activity', { params: { limit } }),
};
