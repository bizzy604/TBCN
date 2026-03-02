'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LessonContent } from '@/components/lessons/LessonContent';
import { LessonNavigation } from '@/components/lessons/LessonNavigation';
import { ProgressTracker } from '@/components/lessons/ProgressTracker';
import { useMyEnrollments, useLessonProgress, useUpdateProgress } from '@/hooks/use-enrollments';
import { useProgramBySlug } from '@/hooks/use-programs';
import type { Enrollment, LessonProgress } from '@/lib/api/enrollments';
import type { Lesson, ProgramModule } from '@/lib/api/programs';

interface LessonPlayerProps {
  programSlug: string;
  lessonId: string;
}

function findLesson(modules: ProgramModule[], lessonId: string): Lesson | null {
  for (const module of modules) {
    const lesson = module.lessons?.find((entry) => entry.id === lessonId);
    if (lesson) {
      return lesson;
    }
  }
  return null;
}

function getAdjacentLessons(modules: ProgramModule[], lessonId: string) {
  const lessons: Lesson[] = [];
  modules.forEach((module) => {
    if (module.lessons) {
      lessons.push(...module.lessons);
    }
  });
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    currentIndex: index,
    total: lessons.length,
  };
}

export default function LessonPlayerClient({ programSlug, lessonId }: LessonPlayerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: program, isLoading: programLoading } = useProgramBySlug(programSlug);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);
  const updateProgress = useUpdateProgress();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setSidebarOpen(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setSidebarOpen(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const enrollment: Enrollment | undefined = useMemo(() => {
    if (!program || !enrollmentsData?.data) {
      return undefined;
    }
    return enrollmentsData.data.find((item: Enrollment) => item.programId === program.id);
  }, [enrollmentsData?.data, program]);

  const { data: progressData } = useLessonProgress(enrollment?.id || '');

  const progressMap = useMemo(() => {
    const map: Record<string, LessonProgress> = {};
    if (Array.isArray(progressData)) {
      progressData.forEach((entry: LessonProgress) => {
        map[entry.lessonId] = entry;
      });
    }
    return map;
  }, [progressData]);

  const lesson = program?.modules ? findLesson(program.modules, lessonId) : null;
  const { prev, next, currentIndex, total } = program?.modules
    ? getAdjacentLessons(program.modules, lessonId)
    : { prev: null, next: null, currentIndex: -1, total: 0 };

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

  const markComplete = useCallback(() => {
    if (!enrollment) return;
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      data: { lessonId, completed: true },
    });
  }, [enrollment, lessonId, updateProgress]);

  if (programLoading) {
    return <div className="card h-80 animate-pulse bg-muted/55" />;
  }

  if (!program || !lesson) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-2xl font-semibold">Lesson not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This lesson does not exist or is unavailable.</p>
        <Link href={`/programs/${programSlug}`} className="btn btn-primary mt-5">
          Back to Program
        </Link>
      </div>
    );
  }

  const completed = !!progressMap[lessonId]?.completed;

  return (
    <div className="-mx-4 -mt-8 flex h-[calc(100vh-5rem)] sm:-mx-6 lg:-mx-8">
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:border-r-0'
        }`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="mb-4 rounded-xl border border-border bg-background p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Course Navigation</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{program.title}</p>
          </div>
          {enrollment && <ProgressTracker enrollment={enrollment} compact />}
          <div className="mt-4">
            <LessonNavigation
              modules={program.modules || []}
              currentLessonId={lessonId}
              programSlug={programSlug}
              progressMap={progressMap}
            />
          </div>
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-border bg-sidebar px-4 py-3 text-sidebar-foreground sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="btn btn-sm border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground"
            >
              {sidebarOpen ? 'Hide Outline' : 'Show Outline'}
            </button>
            <div className="min-w-0 flex-1 text-right sm:text-left">
              <p className="truncate text-sm font-semibold text-white">{lesson.title}</p>
              <p className="text-xs text-sidebar-foreground/75">Lesson {currentIndex + 1} of {total}</p>
            </div>
            {enrollment && (
              <button
                type="button"
                onClick={markComplete}
                disabled={completed || updateProgress.isPending}
                className={`btn btn-sm ${completed ? 'btn-secondary' : 'btn-primary'}`}
              >
                {completed ? 'Completed' : 'Mark as Complete'}
              </button>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          {lesson.description && <p className="text-sm text-muted-foreground">{lesson.description}</p>}

          <LessonContent
            lesson={lesson}
            programSlug={programSlug}
            lessonId={lessonId}
            startPosition={progressMap[lessonId]?.lastPosition}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            onVideoComplete={markComplete}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-sm">
            {prev ? (
              <Link href={`/programs/${programSlug}/lessons/${prev.id}`} className="btn btn-outline btn-sm">
                Previous Lesson
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/programs/${programSlug}/lessons/${next.id}`} className="btn btn-primary btn-sm">
                Next Lesson
              </Link>
            ) : (
              <Link href={`/programs/${programSlug}`} className="btn btn-secondary btn-sm">
                Finish and Return
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
