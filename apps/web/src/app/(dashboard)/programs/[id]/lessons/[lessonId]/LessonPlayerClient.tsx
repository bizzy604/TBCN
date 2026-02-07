'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProgramBySlug } from '@/hooks/use-programs';
import { useMyEnrollments, useLessonProgress, useUpdateProgress } from '@/hooks/use-enrollments';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonNavigation } from '@/components/lessons/LessonNavigation';
import { ProgressTracker } from '@/components/lessons/ProgressTracker';
import type { Lesson, ProgramModule } from '@/lib/api/programs';
import type { LessonProgress, Enrollment } from '@/lib/api/enrollments';

interface LessonPlayerProps {
  programSlug: string;
  lessonId: string;
}

/** Find a lesson across all modules */
function findLesson(modules: ProgramModule[], lessonId: string): Lesson | null {
  for (const mod of modules) {
    const lesson = mod.lessons?.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

/** Get previous/next lesson IDs */
function getAdjacentLessons(modules: ProgramModule[], lessonId: string) {
  const flatLessons: Lesson[] = [];
  for (const mod of modules) {
    if (mod.lessons) flatLessons.push(...mod.lessons);
  }
  const idx = flatLessons.findIndex((l) => l.id === lessonId);
  return {
    prev: idx > 0 ? flatLessons[idx - 1] : null,
    next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null,
    currentIndex: idx,
    total: flatLessons.length,
  };
}

export default function LessonPlayerClient({ programSlug, lessonId }: LessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: program, isLoading: programLoading } = useProgramBySlug(programSlug);

  // Open sidebar by default on desktop, closed on mobile
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    setSidebarOpen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);
  const updateProgress = useUpdateProgress();

  // Find the enrollment for this program
  const enrollment: Enrollment | undefined = useMemo(() => {
    if (!enrollmentsData?.data || !program) return undefined;
    return enrollmentsData.data.find((e: Enrollment) => e.programId === program.id);
  }, [enrollmentsData, program]);

  const { data: progressData } = useLessonProgress(enrollment?.id || '');

  // Build progress map
  const progressMap = useMemo(() => {
    const map: Record<string, LessonProgress> = {};
    if (Array.isArray(progressData)) {
      progressData.forEach((p: LessonProgress) => {
        map[p.lessonId] = p;
      });
    }
    return map;
  }, [progressData]);

  const lesson = program?.modules ? findLesson(program.modules, lessonId) : null;
  const { prev, next, currentIndex, total } = program?.modules
    ? getAdjacentLessons(program.modules, lessonId)
    : { prev: null, next: null, currentIndex: -1, total: 0 };

  // Mark lesson as accessed / update progress
  const handleVideoTimeUpdate = useCallback(
    (currentTime: number) => {
      if (!enrollment) return;
      updateProgress.mutate({
        enrollmentId: enrollment.id,
        data: { lessonId, lastPosition: currentTime },
      });
    },
    [enrollment, lessonId, updateProgress],
  );

  const handleVideoComplete = useCallback(() => {
    if (!enrollment) return;
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      data: { lessonId, completed: true },
    });
  }, [enrollment, lessonId, updateProgress]);

  const handleMarkComplete = useCallback(() => {
    if (!enrollment) return;
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      data: { lessonId, completed: true },
    });
  }, [enrollment, lessonId, updateProgress]);

  if (programLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!program || !lesson) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Lesson Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This lesson doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Link
          href={`/programs/${programSlug}`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Back to Program
        </Link>
      </div>
    );
  }

  const isCompleted = progressMap[lessonId]?.completed;

  return (
    <div className="flex h-[calc(100vh-5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — overlay on mobile, inline on desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-80 border-r border-border bg-card overflow-y-auto transition-transform duration-300 ease-in-out
          lg:static lg:z-auto lg:transition-all lg:duration-200 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:border-r-0'}
          ${sidebarOpen ? 'lg:w-80' : ''}
        `}
      >
        {/* Close button — mobile only */}
        <div className="flex items-center justify-end p-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted transition"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Program title */}
          <div>
            <h2 className="text-sm font-semibold text-foreground">{program.title}</h2>
          </div>

          {/* Progress tracker */}
          {enrollment && <ProgressTracker enrollment={enrollment} compact />}

          {/* Lesson navigation */}
          <LessonNavigation
            modules={program.modules || []}
            currentLessonId={lessonId}
            programSlug={programSlug}
            progressMap={progressMap}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-muted transition shrink-0"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{lesson.title}</h1>
              <p className="text-xs text-muted-foreground">
                Lesson {currentIndex + 1} of {total}
              </p>
            </div>
          </div>

          {/* Completion toggle */}
          {enrollment && (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleted || updateProgress.isPending}
              className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition shrink-0 ${
                isCompleted
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {isCompleted ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </>
              ) : (
                'Mark Complete'
              )}
            </button>
          )}
        </div>

        {/* Lesson body */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Description */}
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}

          {/* Content */}
          <LessonContent
            lesson={lesson}
            programSlug={programSlug}
            lessonId={lessonId}
            startPosition={progressMap[lessonId]?.lastPosition}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            onVideoComplete={handleVideoComplete}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            {prev ? (
              <Link
                href={`/programs/${programSlug}/lessons/${prev.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="max-w-[200px] truncate">{prev.title}</span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/programs/${programSlug}/lessons/${next.id}`}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline transition"
              >
                <span className="max-w-[200px] truncate">{next.title}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/programs/${programSlug}`}
                className="flex items-center gap-2 text-sm font-medium text-green-600 hover:underline transition"
              >
                Finish &amp; Back to Program
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
