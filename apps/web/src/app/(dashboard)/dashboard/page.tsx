'use client';

import Link from 'next/link';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { useAuth, useCommunityPosts, useEvents, useMyEnrollments, useProgramCatalog } from '@/hooks';
import type { Enrollment } from '@/lib/api/enrollments';
import { Card } from '@/components/ui/Card';

function normalizeStatus(value?: string) {
  return (value || '').toUpperCase();
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useMyEnrollments(1, 50);
  const { data: catalogData } = useProgramCatalog({ page: 1, limit: 6, status: 'published' });
  const { data: eventsData } = useEvents({ upcoming: true });
  const { data: postsData } = useCommunityPosts();

  const enrollments = enrollmentsData?.data ?? [];

  const stats = useMemo(() => {
    const completed = enrollments.filter((item: Enrollment) => normalizeStatus(item.status) === 'COMPLETED').length;
    const totalHours = Math.round(
      enrollments.reduce((sum: number, item: Enrollment) => sum + Number(item.totalLessons || 0) * 0.6, 0),
    );
    const certificates = enrollments.filter((item: Enrollment) => !!item.certificateId).length;

    return {
      enrolled: enrollments.length,
      completed,
      hours: totalHours,
      certificates,
      posts: postsData?.data?.length || 0,
    };
  }, [enrollments, postsData?.data?.length]);

  const continueLearning = useMemo(() => {
    return [...enrollments]
      .filter((item: Enrollment) => normalizeStatus(item.status) !== 'COMPLETED')
      .sort((a: Enrollment, b: Enrollment) => {
        const aDate = new Date(a.lastAccessedAt || a.enrolledAt).getTime();
        const bDate = new Date(b.lastAccessedAt || b.enrolledAt).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [enrollments]);

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const checks = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.avatarUrl,
      user.timezone,
    ];
    const complete = checks.filter(Boolean).length;
    return Math.round((complete / checks.length) * 100);
  }, [user]);

  if (authLoading || enrollmentsLoading) {
    return <div className="card h-80 animate-pulse bg-muted/55" />;
  }

  return (
    <div className="space-y-6">
      {profileCompletion < 80 && (
        <div className="rounded-xl border border-accent/40 bg-accent/18 px-4 py-3 text-sm text-amber-900">
          <strong>Profile completion is {profileCompletion}%.</strong> Add missing profile details to improve recommendations.
          <Link href="/settings/profile/edit" className="ml-2 font-semibold underline">
            Complete profile
          </Link>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
          <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Member Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Welcome back, {user?.firstName || 'Member'}</h1>
          <p className="mt-2 text-sm text-sidebar-foreground/80">Track your learning and manage upcoming activities from one place.</p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          <StatCard icon={<AcademicCapIcon className="h-5 w-5" />} label="Courses Enrolled" value={stats.enrolled} />
          <StatCard icon={<ClockIcon className="h-5 w-5" />} label="Hours Learned" value={stats.hours} accent="secondary" />
          <StatCard icon={<DocumentCheckIcon className="h-5 w-5" />} label="Certificates" value={stats.certificates} accent="accent" />
          <StatCard icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />} label="Community Posts" value={stats.posts} />
        </div>
      </Card>

      <section className="dashboard-panel">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Link href="/enrollments" className="text-sm font-medium text-secondary hover:text-primary">
            View all
          </Link>
        </div>

        {continueLearning.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active enrollments yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {continueLearning.map((item) => (
              <Link key={item.id} href={`/programs/${item.program?.slug || item.programId}`} className="card-hover p-4">
                <p className="text-sm font-semibold text-foreground">{item.program?.title || 'Program'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.completedLessons}/{item.totalLessons} lessons complete
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Number(item.progressPercentage || 0))}%` }} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                  Continue
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="dashboard-panel">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="mt-4 space-y-3">
            {(eventsData?.data ?? []).slice(0, 3).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="card-hover flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(event.startAt).toLocaleString()}</p>
                </div>
                <span className="badge bg-secondary/15 text-secondary">{event.locationType}</span>
              </Link>
            ))}
            {(eventsData?.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
          </div>
        </section>

        <section className="dashboard-panel">
          <h2 className="text-xl font-semibold">Community Activity</h2>
          <div className="mt-4 space-y-3">
            {(postsData?.data ?? []).slice(0, 3).map((post) => (
              <Link key={post.id} href={`/community/posts/${post.id}`} className="card-hover block p-3">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</p>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{post.content}</p>
              </Link>
            ))}
            {(postsData?.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No recent community posts.</p>}
          </div>
        </section>
      </div>

      <section className="dashboard-panel">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <Link href="/programs" className="text-sm font-medium text-secondary hover:text-primary">
            Browse catalog
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(catalogData?.data ?? []).slice(0, 3).map((program) => (
            <Link key={program.id} href={`/programs/${program.slug}`} className="card-hover p-4">
              <p className="text-sm font-semibold text-foreground">{program.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{program.shortDescription || 'Practical learning path for your next stage.'}</p>
              <p className="mt-3 text-xs font-semibold text-primary">View Program</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = 'primary',
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: 'primary' | 'secondary' | 'accent';
}) {
  const tones = {
    primary: 'bg-primary/12 text-primary',
    secondary: 'bg-secondary/12 text-secondary',
    accent: 'bg-accent/18 text-amber-900',
  };

  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tones[accent]}`}>{icon}</span>
      </div>
    </article>
  );
}
