'use client';

import { ProgressBar } from '@/components/programs/ProgressBar';
import type { Enrollment } from '@/lib/api/enrollments';

interface ProgressTrackerProps {
  enrollment: Enrollment;
  compact?: boolean;
}

export function ProgressTracker({ enrollment, compact = false }: ProgressTrackerProps) {
  const percentage = Math.round(enrollment.progressPercentage);
  const isCompleted = enrollment.status === 'completed';

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <ProgressBar value={enrollment.progressPercentage} size="sm" className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
          {percentage}%
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Your Progress</h3>
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </span>
        )}
      </div>

      <ProgressBar value={enrollment.progressPercentage} size="md" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {enrollment.completedLessons} of {enrollment.totalLessons} lessons
        </span>
        <span className="font-medium text-foreground">{percentage}%</span>
      </div>

      {enrollment.lastAccessedAt && (
        <p className="text-xs text-muted-foreground">
          Last studied {new Date(enrollment.lastAccessedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      {isCompleted && enrollment.completedAt && (
        <p className="text-xs text-green-600 dark:text-green-400">
          Completed on {new Date(enrollment.completedAt).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
}