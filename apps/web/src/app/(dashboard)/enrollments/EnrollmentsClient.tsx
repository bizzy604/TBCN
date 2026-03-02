'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMyEnrollments } from '@/hooks/use-enrollments';
import { ProgressBar } from '@/components/programs/ProgressBar';
import { Card } from '@/components/ui/Card';
import type { Enrollment } from '@/lib/api/enrollments';

type LearningTab = 'in_progress' | 'completed' | 'saved';

function normalizeStatus(status: string) {
  return status.toUpperCase();
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const program = enrollment.program;
  const completion = Math.round(Number(enrollment.progressPercentage || 0));

  return (
    <article className="card-hover p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-foreground">{program?.title || 'Program'}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {program?.difficulty || 'All Levels'} · {enrollment.completedLessons}/{enrollment.totalLessons} lessons
          </p>
        </div>
        <span className={`badge ${completion >= 100 ? 'bg-secondary/15 text-secondary' : 'bg-primary/12 text-primary'}`}>
          {completion >= 100 ? 'Completed' : 'In Progress'}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar value={completion} showLabel={false} />
        <p className="mt-2 text-xs text-muted-foreground">{completion}% complete</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/programs/${program?.slug || enrollment.programId}`} className="btn btn-sm btn-primary">
          Continue
        </Link>
        {enrollment.certificateId && (
          <Link href={`/certificates/${enrollment.certificateId}`} className="btn btn-sm btn-outline">
            View Certificate
          </Link>
        )}
      </div>
    </article>
  );
}

export default function EnrollmentsClient() {
  const [tab, setTab] = useState<LearningTab>('in_progress');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useMyEnrollments();
  const enrollments: Enrollment[] = data?.data || [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = enrollments.filter((item) => {
      if (!query) return true;
      return item.program?.title?.toLowerCase().includes(query) || false;
    });

    if (tab === 'completed') {
      return matches.filter((item) => normalizeStatus(item.status) === 'COMPLETED');
    }
    if (tab === 'in_progress') {
      return matches.filter((item) => normalizeStatus(item.status) !== 'COMPLETED');
    }
    return [];
  }, [enrollments, search, tab]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">My Learning</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Course Library</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Track in-progress and completed programs in one place.</p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === 'in_progress'} onClick={() => setTab('in_progress')}>
            In Progress
          </TabButton>
          <TabButton active={tab === 'completed'} onClick={() => setTab('completed')}>
            Completed
          </TabButton>
          <TabButton active={tab === 'saved'} onClick={() => setTab('saved')}>
            Saved
          </TabButton>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input"
          placeholder="Search your learning library"
        />

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="card h-40 animate-pulse bg-muted/55" />
            ))}
          </div>
        ) : tab === 'saved' ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold">No saved programs yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Saved courses will appear here.</p>
            <Link href="/programs" className="btn btn-primary mt-5">
              Explore Programs
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold">No courses found</p>
            <p className="mt-2 text-sm text-muted-foreground">You have not enrolled in any courses for this tab yet.</p>
            <Link href="/programs" className="btn btn-primary mt-5">
              Explore Programs
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
    >
      {children}
    </button>
  );
}
