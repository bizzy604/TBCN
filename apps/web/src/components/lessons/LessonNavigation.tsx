'use client';

import Link from 'next/link';
import type { ProgramModule } from '@/lib/api/programs';
import type { LessonProgress } from '@/lib/api/enrollments';

interface LessonNavigationProps {
  modules: ProgramModule[];
  currentLessonId: string;
  programSlug: string;
  progressMap?: Record<string, LessonProgress>;
  onLessonSelect?: (lessonId: string) => void;
}

function lessonTypeLabel(contentType: string) {
  if (contentType === 'video') return 'Video';
  if (contentType === 'text') return 'Reading';
  if (contentType === 'quiz') return 'Quiz';
  if (contentType === 'assignment') return 'Assignment';
  return 'Lesson';
}

export function LessonNavigation({
  modules,
  currentLessonId,
  programSlug,
  progressMap = {},
  onLessonSelect,
}: LessonNavigationProps) {
  return (
    <div className="space-y-4">
      {modules.map((module, moduleIndex) => (
        <section key={module.id}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Module {moduleIndex + 1}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{module.title}</p>

          <div className="mt-2 space-y-1.5">
            {module.lessons?.map((lesson, lessonIndex) => {
              const isCurrent = lesson.id === currentLessonId;
              const isCompleted = !!progressMap[lesson.id]?.completed;
              return (
                <Link
                  key={lesson.id}
                  href={`/programs/${programSlug}/lessons/${lesson.id}`}
                  onClick={(event) => {
                    if (onLessonSelect) {
                      event.preventDefault();
                      onLessonSelect(lesson.id);
                    }
                  }}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isCurrent
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/55'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
                      {isCompleted ? 'OK' : lessonIndex + 1}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.08em]">{lessonTypeLabel(lesson.contentType)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
