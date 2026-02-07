'use client';

import Link from 'next/link';
import type { ProgramModule, Lesson } from '@/lib/api/programs';
import type { LessonProgress } from '@/lib/api/enrollments';

interface LessonNavigationProps {
  modules: ProgramModule[];
  currentLessonId: string;
  programSlug: string;
  /** Map of lessonId => LessonProgress */
  progressMap?: Record<string, LessonProgress>;
  onLessonSelect?: (lessonId: string) => void;
}

export function LessonNavigation({
  modules,
  currentLessonId,
  programSlug,
  progressMap = {},
  onLessonSelect,
}: LessonNavigationProps) {
  return (
    <div className="space-y-1">
      {modules.map((mod, modIdx) => (
        <div key={mod.id}>
          {/* Module header */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Module {modIdx + 1}
            </p>
            <p className="text-sm font-medium text-foreground">{mod.title}</p>
          </div>

          {/* Lessons */}
          <div className="space-y-0.5 ml-1">
            {mod.lessons?.map((lesson, lessonIdx) => {
              const isCurrent = lesson.id === currentLessonId;
              const progress = progressMap[lesson.id];
              const isCompleted = progress?.completed;

              return (
                <Link
                  key={lesson.id}
                  href={`/programs/${programSlug}/lessons/${lesson.id}`}
                  onClick={(e) => {
                    if (onLessonSelect) {
                      e.preventDefault();
                      onLessonSelect(lesson.id);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                    isCurrent
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  {/* Status icon */}
                  <span className="shrink-0">
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="flex w-4 h-4 items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      </span>
                    ) : (
                      <span className="flex w-4 h-4 items-center justify-center text-xs text-muted-foreground">
                        {lessonIdx + 1}
                      </span>
                    )}
                  </span>

                  {/* Title */}
                  <span className="truncate flex-1">{lesson.title}</span>

                  {/* Type indicator */}
                  <span className="text-xs shrink-0">
                    {lesson.contentType === 'video' && '▶'}
                    {lesson.contentType === 'text' && '📄'}
                    {lesson.contentType === 'quiz' && '📝'}
                    {lesson.contentType === 'assignment' && '✏️'}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* divider between modules */}
          {modIdx < modules.length - 1 && (
            <div className="my-2 border-t border-border/50" />
          )}
        </div>
      ))}
    </div>
  );
}