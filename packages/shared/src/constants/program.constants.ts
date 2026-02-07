// ============================================
// Program Constants
// ============================================

export enum ProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  RESOURCE = 'resource',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  EXPIRED = 'expired',
}

export enum AssessmentType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PEER_REVIEW = 'peer_review',
  CAPSTONE = 'capstone',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  REQUIRES_REVIEW = 'requires_review',
}

export const MAX_ASSESSMENT_ATTEMPTS = 3;
export const PASSING_GRADE = 70;
