'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coachesApi, type AvailabilityQuery, type CoachesQuery } from '@/lib/api/coaches';
import { sessionsApi, type CreateSessionPayload, type SessionQuery, type UpdateSessionPayload, type FeedbackPayload } from '@/lib/api/sessions';

export const coachingKeys = {
  all: ['coaching'] as const,
  coaches: (params?: CoachesQuery) => ['coaching', 'coaches', params] as const,
  coach: (id: string) => ['coaching', 'coach', id] as const,
  availability: (coachId: string, params?: AvailabilityQuery) =>
    ['coaching', 'availability', coachId, params] as const,
  sessions: (params?: SessionQuery) => ['coaching', 'sessions', params] as const,
  session: (id: string) => ['coaching', 'session', id] as const,
};

export function useCoaches(params?: CoachesQuery) {
  return useQuery({
    queryKey: coachingKeys.coaches(params),
    queryFn: () => coachesApi.getAll(params),
  });
}

export function useCoach(id: string) {
  return useQuery({
    queryKey: coachingKeys.coach(id),
    queryFn: () => coachesApi.getById(id),
    enabled: !!id,
  });
}

export function useCoachAvailability(coachId: string, params?: AvailabilityQuery) {
  return useQuery({
    queryKey: coachingKeys.availability(coachId, params),
    queryFn: () => {
      if (!params) {
        throw new Error('Availability query params are required');
      }
      return coachesApi.getAvailability(coachId, params);
    },
    enabled: !!coachId && !!params,
  });
}

export function useSessions(params?: SessionQuery) {
  return useQuery({
    queryKey: coachingKeys.sessions(params),
    queryFn: () => sessionsApi.getMine(params),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => sessionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coachingKeys.sessions() });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionPayload }) =>
      sessionsApi.update(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: coachingKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: coachingKeys.session(vars.id) });
    },
  });
}

export function useSubmitSessionFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FeedbackPayload }) =>
      sessionsApi.submitFeedback(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: coachingKeys.session(vars.id) });
      queryClient.invalidateQueries({ queryKey: coachingKeys.sessions() });
    },
  });
}

