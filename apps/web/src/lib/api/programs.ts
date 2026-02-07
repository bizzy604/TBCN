import { api } from './client';

export interface ProgramSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  difficulty: string;
  price: number;
  currency: string;
  isFree: boolean;
  enrollmentCount: number;
  averageRating: number | null;
  totalRatings: number;
  estimatedDuration: number | null;
  tags: string[];
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  resourceUrls: string[];
  sortOrder: number;
  isFree: boolean;
  estimatedDuration: number | null;
}

export interface ProgramModule {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  estimatedDuration: number | null;
  lessons: Lesson[];
  lessonCount: number;
}

export interface Program extends ProgramSummary {
  description: string;
  bannerUrl: string | null;
  instructorId: string | null;
  status: string;
  prerequisites: string[];
  learningOutcomes: string[];
  maxEnrollments: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  modules?: ProgramModule[];
}

export interface ProgramQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  difficulty?: string;
  tag?: string;
  isFree?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const programsApi = {
  // Public endpoints
  getCatalog: (params?: ProgramQueryParams) =>
    api.getRaw<PaginatedResponse<ProgramSummary>>('/programs/catalog', { params }),

  getBySlug: (slug: string) =>
    api.get<Program>(`/programs/catalog/${slug}`),

  // Authenticated endpoints
  getAll: (params?: ProgramQueryParams) =>
    api.getRaw<PaginatedResponse<Program>>('/programs', { params }),

  getById: (id: string) =>
    api.get<Program>(`/programs/${id}`),

  getStats: () =>
    api.get<{ total: number; published: number; draft: number; totalEnrollments: number }>('/programs/stats'),

  create: (data: Partial<Program>) =>
    api.post<Program>('/programs', data),

  update: (id: string, data: Partial<Program>) =>
    api.put<Program>(`/programs/${id}`, data),

  publish: (id: string) =>
    api.patch<Program>(`/programs/${id}/publish`),

  archive: (id: string) =>
    api.patch<Program>(`/programs/${id}/archive`),

  delete: (id: string) =>
    api.delete(`/programs/${id}`),

  // Modules
  getModules: (programId: string) =>
    api.get<ProgramModule[]>(`/programs/${programId}/modules`),

  createModule: (programId: string, data: Partial<ProgramModule>) =>
    api.post<ProgramModule>(`/programs/${programId}/modules`, data),

  updateModule: (moduleId: string, data: Partial<ProgramModule>) =>
    api.put<ProgramModule>(`/programs/modules/${moduleId}`, data),

  deleteModule: (moduleId: string) =>
    api.delete(`/programs/modules/${moduleId}`),

  // Lessons
  getLessons: (moduleId: string) =>
    api.get<Lesson[]>(`/programs/modules/${moduleId}/lessons`),

  getLesson: (lessonId: string) =>
    api.get<Lesson>(`/programs/lessons/${lessonId}`),

  createLesson: (moduleId: string, data: Partial<Lesson>) =>
    api.post<Lesson>(`/programs/modules/${moduleId}/lessons`, data),

  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    api.put<Lesson>(`/programs/lessons/${lessonId}`, data),

  deleteLesson: (lessonId: string) =>
    api.delete(`/programs/lessons/${lessonId}`),
};
