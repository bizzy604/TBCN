'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export const analyticsKeys = {
  overview: (params?: { from?: string; to?: string }) => ['analytics', 'overview', params] as const,
  activity: (limit = 12) => ['analytics', 'activity', limit] as const,
};

export function useAdminOverview(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsApi.getAdminOverview(params),
  });
}

export function useAdminActivity(limit = 12) {
  return useQuery({
    queryKey: analyticsKeys.activity(limit),
    queryFn: () => analyticsApi.getAdminActivity(limit),
  });
}
