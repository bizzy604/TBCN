'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMyEnrollments } from '@/hooks/use-enrollments';
import { ProgressBar } from '@/components/programs/ProgressBar';
import type { Enrollment } from '@/lib/api/enrollments';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dropped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const program = enrollment.program;
  const isCompleted = enrollment.status === 'completed';
  const isActive = enrollment.status === 'active';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-36 sm:h-auto shrink-0">
          {program?.thumbnailUrl ? (
            <Image
              src={program.thumbnailUrl}
              alt={program.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-3xl">
              📚
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {program?.title || 'Unknown Program'}
              </h3>
              {program?.difficulty && (
                <p className="text-xs text-muted-foreground capitalize mt-1">
                  {program.difficulty}
                </p>
              )}
            </div>
            <StatusBadge status={enrollment.status} />
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {enrollment.completedLessons} of {enrollment.totalLessons} lessons
              </span>
              <span className="font-medium text-foreground">
                {Math.round(enrollment.progressPercentage)}%
              </span>
            </div>
            <ProgressBar value={enrollment.progressPercentage} size="sm" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              {enrollment.lastAccessedAt
                ? `Last accessed ${new Date(enrollment.lastAccessedAt).toLocaleDateString()}`
                : `Enrolled ${new Date(enrollment.enrolledAt).toLocaleDateString()}`}
            </p>
            {isActive && (
              <Link
                href={`/programs/${program?.slug || enrollment.programId}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Continue Learning
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {isCompleted && enrollment.certificateId && (
              <Link
                href={`/certificates/${enrollment.certificateId}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline"
              >
                View Certificate
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnrollmentsClient() {
  const { data, isLoading } = useMyEnrollments();
  const enrollments: Enrollment[] = data?.data || [];

  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed');
  const otherEnrollments = enrollments.filter(
    (e) => e.status !== 'active' && e.status !== 'completed',
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="mt-2 text-muted-foreground">Track your active enrollments and course progress.</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="mt-2 text-muted-foreground">
            Track your active enrollments and course progress.
          </p>
        </div>
        <Link
          href="/programs"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Browse Programs
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="text-4xl">📋</div>
            <h2 className="text-xl font-semibold">No Enrollments Yet</h2>
            <p className="text-sm text-muted-foreground">
              Start your learning journey by enrolling in a program.
            </p>
            <Link
              href="/programs"
              className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active */}
          {activeEnrollments.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                In Progress ({activeEnrollments.length})
              </h2>
              <div className="space-y-4">
                {activeEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completedEnrollments.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Completed ({completedEnrollments.length})
              </h2>
              <div className="space-y-4">
                {completedEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}

          {/* Other */}
          {otherEnrollments.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                Other ({otherEnrollments.length})
              </h2>
              <div className="space-y-4">
                {otherEnrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
