import {
  ProgramStatus,
  DifficultyLevel,
  ContentType,
  EnrollmentStatus,
  AssessmentType,
  QuestionType,
  SubmissionStatus,
} from '../constants/program.constants';

export {
  ProgramStatus,
  DifficultyLevel,
  ContentType,
  EnrollmentStatus,
  AssessmentType,
  QuestionType,
  SubmissionStatus,
};

// ============================================
// Program Types
// ============================================

export interface ProgramBase {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  instructorId: string;
  status: ProgramStatus;
  difficulty: DifficultyLevel;
  price: number;
  currency: string;
  isFree: boolean;
  estimatedDuration: number | null; // minutes
  tags: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  maxEnrollments: number | null;
  enrollmentCount: number;
  averageRating: number | null;
  totalRatings: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramModuleBase {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessonCount: number;
  estimatedDuration: number | null;
}

export interface LessonBase {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  content: string | null; // text/markdown content
  videoUrl: string | null;
  videoDuration: number | null; // seconds
  resourceUrls: string[];
  sortOrder: number;
  isFree: boolean; // preview lesson
  estimatedDuration: number | null; // minutes
}

// ============================================
// Enrollment Types
// ============================================

export interface EnrollmentBase {
  id: string;
  userId: string;
  programId: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  enrolledAt: string;
  certificateId: string | null;
}

export interface LessonProgressBase {
  id: string;
  enrollmentId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  timeSpent: number; // seconds
  lastPosition: number; // video position in seconds
}

// ============================================
// Assessment Types
// ============================================

export interface AssessmentBase {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  type: AssessmentType;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  questions: QuestionBase[];
}

export interface QuestionBase {
  id: string;
  text: string;
  type: QuestionType;
  options: string[] | null; // for multiple choice
  correctAnswer: string | null; // hidden from client for objective types
  points: number;
  sortOrder: number;
}

export interface AssessmentSubmissionBase {
  id: string;
  assessmentId: string;
  enrollmentId: string;
  userId: string;
  answers: Record<string, string>;
  score: number | null;
  passed: boolean | null;
  status: SubmissionStatus;
  attemptNumber: number;
  feedback: string | null;
  gradedBy: string | null;
  submittedAt: string;
  gradedAt: string | null;
}
