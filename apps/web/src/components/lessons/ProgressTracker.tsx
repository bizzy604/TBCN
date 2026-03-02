'use client';

import type { Enrollment } from '@/lib/api/enrollments';
import { ProgressBar } from '@/components/programs/ProgressBar';

interface ProgressTrackerProps {
  enrollment: Enrollment;
  compact?: boolean;
}

export function ProgressTracker({ enrollment, compact = false }: ProgressTrackerProps) {
  const percentage = Math.round(Number(enrollment.progressPercentage || 0));
  const completed = (enrollment.status || '').toUpperCase() === 'COMPLETED';

  if (compact) {
    return (
      <div className="rounded-xl border border-border bg-background p-3">
        <ProgressBar value={percentage} size="sm" showLabel={false} />
        <p className="mt-1 text-xs text-muted-foreground">{percentage}% complete</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Your Progress</p>
        {completed && <span className="badge-success">Completed</span>}
      </div>

      <ProgressBar value={percentage} />

      <p className="mt-2 text-xs text-muted-foreground">
        {enrollment.completedLessons} of {enrollment.totalLessons} lessons completed
      </p>
    </div>
  );
}
