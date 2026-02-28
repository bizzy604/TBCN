import { api } from './client';

export interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  tagline: string | null;
  bio: string | null;
  hourlyRate: number;
  currency: string;
  yearsExperience: number;
  specialties: string[];
  languages: string[];
  stats: {
    totalSessions: number;
    averageRating: number;
    reviewCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CoachesResponse {
  data: Coach[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CoachAvailabilitySlot {
  startAt: string;
  endAt: string;
  isAvailable: boolean;
  reason?: string;
}

export interface CoachAvailabilityDay {
  date: string;
  slots: CoachAvailabilitySlot[];
}

export interface CoachAvailabilityResponse {
  coachId: string;
  timezone: string;
  availability: CoachAvailabilityDay[];
}

export interface CoachesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AvailabilityQuery {
  startDate: string;
  endDate: string;
  durationMinutes?: number;
}

export const coachesApi = {
  getAll: (params?: CoachesQuery) =>
    api.getRaw<CoachesResponse>('/coaches', { params }),

  getById: (id: string) =>
    api.get<Coach>(`/coaches/${id}`),

  getAvailability: (coachId: string, params: AvailabilityQuery) =>
    api.get<CoachAvailabilityResponse>(`/coaches/${coachId}/availability`, { params }),
};
