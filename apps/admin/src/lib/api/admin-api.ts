const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getTokenFromCookie(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getTokenFromCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════

export interface ProgramSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  difficulty: string;
  price: number;
  isFree: boolean;
  enrollmentCount: number;
  averageRating: number | null;
  publishedAt: string | null;
  createdAt: string;
  instructor?: { id: string; firstName: string; lastName: string };
}

export interface ProgramModule {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  estimatedDuration: number | null;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  videoUrl: string | null;
  sortOrder: number;
  isFree: boolean;
  estimatedDuration: number | null;
}

export interface Program extends ProgramSummary {
  description: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  currency: string;
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  maxEnrollments: number | null;
  estimatedDuration: number | null;
  modules: ProgramModule[];
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

export interface ProgramStats {
  total: number;
  published: number;
  draft: number;
  totalEnrollments: number;
}

// ════════════════════════════════════════════════
// Admin Programs API
// ════════════════════════════════════════════════

export const adminProgramsApi = {
  getAll: (params?: Record<string, string | number | boolean | undefined>) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') qs.set(k, String(v));
      });
    }
    return request<PaginatedResponse<ProgramSummary>>(`/programs?${qs.toString()}`);
  },

  getById: (id: string) =>
    request<Program>(`/programs/${id}`),

  getStats: () =>
    request<ProgramStats>('/programs/stats'),

  create: (data: Partial<Program>) =>
    request<Program>('/programs', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Program>) =>
    request<Program>(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  publish: (id: string) =>
    request<Program>(`/programs/${id}/publish`, { method: 'PATCH' }),

  archive: (id: string) =>
    request<Program>(`/programs/${id}/archive`, { method: 'PATCH' }),

  delete: (id: string) =>
    request<void>(`/programs/${id}`, { method: 'DELETE' }),

  // Modules
  getModules: (programId: string) =>
    request<ProgramModule[]>(`/programs/${programId}/modules`),

  createModule: (programId: string, data: Partial<ProgramModule>) =>
    request<ProgramModule>(`/programs/${programId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateModule: (moduleId: string, data: Partial<ProgramModule>) =>
    request<ProgramModule>(`/programs/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteModule: (moduleId: string) =>
    request<void>(`/programs/modules/${moduleId}`, { method: 'DELETE' }),

  // Lessons
  createLesson: (moduleId: string, data: Partial<Lesson>) =>
    request<Lesson>(`/programs/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    request<Lesson>(`/programs/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLesson: (lessonId: string) =>
    request<void>(`/programs/lessons/${lessonId}`, { method: 'DELETE' }),
};

// ════════════════════════════════════════════════
// Admin Enrollments API
// ════════════════════════════════════════════════

export interface EnrollmentSummary {
  id: string;
  userId: string;
  programId: string;
  status: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
}

export const adminEnrollmentsApi = {
  getByProgram: (programId: string, page = 1, limit = 20) =>
    request<PaginatedResponse<EnrollmentSummary>>(
      `/enrollments/program/${programId}?page=${page}&limit=${limit}`,
    ),

  getStats: () =>
    request<{ totalActive: number; totalCompleted: number; totalDropped: number }>(
      '/enrollments/stats/overview',
    ),
};