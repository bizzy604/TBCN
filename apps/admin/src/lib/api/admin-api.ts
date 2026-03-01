// Use the Next.js rewrite proxy (/api/:path* → API server) to avoid CORS.
// Only fall back to the full URL for server-side requests where the proxy isn't available.
const API_BASE =
  typeof window !== 'undefined'
    ? '/api/v1'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

// ════════════════════════════════════════════════
// Cookie helpers
// ════════════════════════════════════════════════

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setTokenCookie(token: string): void {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `admin_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeTokenCookie(): void {
  document.cookie = 'admin_token=; path=/; max-age=0';
}

function setUserCookie(user: AuthUser): void {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `admin_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function removeUserCookie(): void {
  document.cookie = 'admin_user=; path=/; max-age=0';
}

// ════════════════════════════════════════════════
// Generic request helper
// ════════════════════════════════════════════════

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getTokenFromCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.data?.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  // The API wraps non-paginated responses in { data: T, timestamp }.
  // Paginated responses are { data: [...], meta: {...}, timestamp } and should NOT be unwrapped
  // (the caller expects { data, meta } to access both the items and pagination info).
  if (json.timestamp && json.data !== undefined && !json.meta) {
    return json.data as T;
  }
  return json as T;
}

// ════════════════════════════════════════════════
// Auth types & API
// ════════════════════════════════════════════════

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  redirectTo?: string;
}

export const LMS_ADMIN_ROLES = ['super_admin', 'admin', 'coach'] as const;
export const PLATFORM_ADMIN_ROLES = ['super_admin', 'admin'] as const;

function getUserCookieValue(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)admin_user=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAdminUserFromCookie(): AuthUser | null {
  const userCookie = getUserCookieValue();
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie) as AuthUser;
  } catch {
    return null;
  }
}

export const adminAuthApi = {
  /** Login with email/password. Rejects users outside LMS portal roles. */
  login: async (email: string, password: string): Promise<AuthUser> => {
    const data = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!LMS_ADMIN_ROLES.includes(data.user.role as (typeof LMS_ADMIN_ROLES)[number])) {
      throw new Error('Access denied. Coach/Admin privileges required.');
    }

    setTokenCookie(data.accessToken);
    setUserCookie(data.user);
    return data.user;
  },

  /** Get current authenticated user from the API. */
  me: () => request<AuthUser>('/auth/me'),

  /** Clear auth cookies and reload. */
  logout: (): void => {
    removeTokenCookie();
    removeUserCookie();
    window.location.href = '/login';
  },

  /** Check if the user is currently authenticated (cookie exists). */
  isAuthenticated: (): boolean => !!getTokenFromCookie(),
};

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
  totalRatings: number;
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
// Assessment types
// ════════════════════════════════════════════════

export interface AssessmentQuestion {
  id?: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
  sortOrder: number;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  type: 'quiz' | 'assignment' | 'peer_review' | 'capstone';
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  questions: AssessmentQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentPayload {
  lessonId: string;
  title: string;
  description?: string;
  type?: Assessment['type'];
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  questions: Omit<AssessmentQuestion, 'id'>[];
}

export interface UpdateAssessmentPayload {
  title?: string;
  description?: string;
  type?: Assessment['type'];
  passingScore?: number;
  maxAttempts?: number;
  timeLimitMinutes?: number | null;
  questions?: AssessmentQuestion[];
}

// ════════════════════════════════════════════════
// Admin Assessments API
// ════════════════════════════════════════════════

export const adminAssessmentsApi = {
  getByLesson: (lessonId: string) =>
    request<Assessment | null>(`/assessments/lesson/${lessonId}`),

  getFull: (id: string) =>
    request<Assessment>(`/assessments/${id}/full`),

  create: (data: CreateAssessmentPayload) =>
    request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateAssessmentPayload) =>
    request<Assessment>(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/assessments/${id}`, { method: 'DELETE' }),
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

// ════════════════════════════════════════════════
// Admin Users API
// ════════════════════════════════════════════════

export interface UserStats {
  [role: string]: number;
}

export const adminUsersApi = {
  getStats: () =>
    request<UserStats>('/users/stats'),
};
