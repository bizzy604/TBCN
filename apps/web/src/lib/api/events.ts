import { api } from './client';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type LocationType = 'virtual' | 'physical' | 'hybrid';
export type EventRegistrationStatus = 'registered' | 'cancelled' | 'attended';

export interface EventItem {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  locationType: LocationType;
  location: string | null;
  meetingUrl: string | null;
  capacity: number | null;
  price: number;
  currency: string;
  bannerUrl: string | null;
  status: EventStatus;
  registrationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: EventRegistrationStatus;
  registeredAt: string;
  event?: EventItem;
}

export interface PaginatedEvents {
  data: EventItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatus;
  upcoming?: boolean;
}

export const eventsApi = {
  list: (params?: EventQuery) =>
    api.getRaw<PaginatedEvents>('/events', { params }),

  getById: (id: string) =>
    api.get<EventItem>(`/events/${id}`),

  create: (payload: {
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    locationType?: LocationType;
    location?: string;
    meetingUrl?: string;
    capacity?: number;
    price?: number;
    currency?: string;
    status?: EventStatus;
    bannerUrl?: string;
  }) => api.post<EventItem>('/events', payload),

  update: (id: string, payload: Partial<{
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    locationType: LocationType;
    location: string;
    meetingUrl: string;
    capacity: number;
    price: number;
    currency: string;
    status: EventStatus;
    bannerUrl: string;
  }>) => api.patch<EventItem>(`/events/${id}`, payload),

  register: (id: string) =>
    api.post<EventRegistration>(`/events/${id}/register`),

  cancelRegistration: (id: string) =>
    api.delete<EventRegistration>(`/events/${id}/register`),

  myRegistrations: () =>
    api.get<EventRegistration[]>('/events/me/registrations'),
};

