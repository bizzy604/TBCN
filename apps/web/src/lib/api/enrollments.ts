import { api } from './client';
import type { PaginatedResponse } from './programs';

export interface Enrollment {
  id: string;
  userId: string;
  programId: string;
  status: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  enrolledAt: string;
  certificateId: string | null;
  program?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    difficulty: string;
    instructorId: string | null;
  };
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  timeSpent: number;
  lastPosition: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  points: number;
  sortOrder: number;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  type: string;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  submissionId: string;
  assessmentId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  attemptsRemaining: number;
  feedback: string | null;
  results: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    correct: boolean;
    points: number;
    earnedPoints: number;
  }>;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  enrollmentId: string;
  userId: string;
  score: number | null;
  passed: boolean | null;
  status: string;
  attemptNumber: number;
  feedback: string | null;
  submittedAt: string;
}

export const enrollmentsApi = {
  // Enroll
  enroll: (programId: string) =>
    api.post<Enrollment>('/enrollments', { programId }),

  // My enrollments
  getMyEnrollments: (page = 1, limit = 10) =>
    api.getRaw<PaginatedResponse<Enrollment>>('/enrollments/me', {
      params: { page, limit },
    }),

  // Get enrollment
  getById: (id: string) =>
    api.get<Enrollment>(`/enrollments/${id}`),

  // Drop enrollment
  drop: (id: string) =>
    api.patch<Enrollment>(`/enrollments/${id}/drop`),

  // Progress
  updateProgress: (enrollmentId: string, data: { lessonId: string; completed?: boolean; timeSpent?: number; lastPosition?: number }) =>
    api.patch<LessonProgress>(`/enrollments/${enrollmentId}/progress`, data),

  getProgress: (enrollmentId: string) =>
    api.get<LessonProgress[]>(`/enrollments/${enrollmentId}/progress`),

  // Assessments
  getAssessment: (assessmentId: string) =>
    api.get<Assessment>(`/assessments/${assessmentId}`),

  getAssessmentByLesson: (lessonId: string) =>
    api.get<Assessment | null>(`/assessments/lesson/${lessonId}`),

  submitAssessment: (assessmentId: string, data: { enrollmentId: string; answers: Record<string, string> }) =>
    api.post<AssessmentResult>(`/assessments/${assessmentId}/submit`, data),

  getMySubmissions: (assessmentId: string) =>
    api.get<AssessmentSubmission[]>(`/assessments/${assessmentId}/submissions`),
};
