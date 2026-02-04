// ============================================
// Program Types - Courses and Learning
// ============================================

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  coverImageUrl: string | null;
  duration: number; // in minutes
  level: ProgramLevel;
  category: string;
  tags: string[];
  price: number;
  currency: string;
  status: ProgramStatus;
  isFeatured: boolean;
  isFree: boolean;
  instructorId: string;
  instructor?: ProgramInstructor;
  modules: ProgramModule[];
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ProgramModule {
  id: string;
  programId: string;
  title: string;
  description: string | null;
  order: number;
  duration: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  order: number;
  type: LessonType;
  duration: number; // in minutes
  contentUrl: string | null;
  content: string | null; // For text-based lessons
  isFree: boolean; // Preview lesson
  isRequired: boolean;
}

export interface ProgramInstructor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
}

export enum ProgramLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels',
}

export enum ProgramStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  DOWNLOAD = 'download',
}
