import { api } from './client';

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type SessionType = 'one_on_one' | 'group' | 'discovery';

export interface SessionUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface SessionFeedback {
  id: string;
  rating: number;
  wouldRecommend: boolean;
  feedbackText: string | null;
  highlights: string[];
  isPublic: boolean;
}

export interface CoachingSession {
  id: string;
  coachId: string;
  menteeId: string;
  scheduledAt: string;
  durationMinutes: number;
  sessionType: SessionType;
  topic: string;
  notes: string | null;
  timezone: string;
  meetingLink: string | null;
  status: SessionStatus;
  cancelledAt: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  coach?: SessionUserSummary;
  mentee?: SessionUserSummary;
  feedback?: SessionFeedback | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionsResponse {
  data: CoachingSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateSessionPayload {
  coachId: string;
  scheduledAt: string;
  durationMinutes: number;
  sessionType?: SessionType;
  topic: string;
  notes?: string;
  timezone?: string;
}

export interface UpdateSessionPayload {
  action: 'reschedule' | 'cancel' | 'complete';
  scheduledAt?: string;
  cancellationReason?: string;
}

export interface SessionQuery {
  page?: number;
  limit?: number;
  role?: 'coach' | 'mentee';
  status?: SessionStatus;
  upcoming?: boolean;
}

export interface FeedbackPayload {
  rating: number;
  wouldRecommend?: boolean;
  feedbackText?: string;
  highlights?: string[];
  isPublic?: boolean;
}

export const sessionsApi = {
  create: (payload: CreateSessionPayload) =>
    api.post<CoachingSession>('/sessions', payload),

  getMine: (params?: SessionQuery) =>
    api.getRaw<SessionsResponse>('/sessions', { params }),

  getById: (id: string) =>
    api.get<CoachingSession>(`/sessions/${id}`),

  update: (id: string, payload: UpdateSessionPayload) =>
    api.patch<CoachingSession>(`/sessions/${id}`, payload),

  submitFeedback: (id: string, payload: FeedbackPayload) =>
    api.post(`/sessions/${id}/feedback`, payload),
};
