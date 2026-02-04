// ============================================
// Enrollment Types - User course progress
// ============================================

export interface Enrollment {
  id: string;
  userId: string;
  programId: string;
  program?: import('./program').Program;
  status: EnrollmentStatus;
  progress: number; // 0-100 percentage
  startedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  lastAccessedAt: string | null;
  lessonProgress: LessonProgress[];
  certificateId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: LessonProgressStatus;
  progress: number; // 0-100 for videos
  watchTime: number; // in seconds
  completedAt: string | null;
  notes: string | null;
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export enum LessonProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalWatchTime: number; // in minutes
  averageProgress: number;
}
