'use client';

import { useMemo } from 'react';
import { useAuth, useMyEnrollments, useProgramCatalog } from '@/hooks';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  Clock,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Enrollment } from '@/lib/api/enrollments';
import { canAccessPartnerWorkspace, canManageCoachingSessions } from '@/lib/auth/rbac';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const canManageSessions = canManageCoachingSessions(user?.role ?? null);
  const canOpenPartnerWorkspace = canAccessPartnerWorkspace(user?.role ?? null);
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useMyEnrollments(1, 50);
  const { data: catalogData, isLoading: catalogLoading } = useProgramCatalog({ limit: 100 });

  const enrollments = enrollmentsData?.data ?? [];
  const totalPrograms = catalogData?.meta?.total ?? 0;

  // Derived stats
  const stats = useMemo(() => {
    const active = enrollments.filter((e: Enrollment) => e.status === 'ACTIVE');
    const completed = enrollments.filter((e: Enrollment) => e.status === 'COMPLETED');
    const totalLessons = enrollments.reduce((sum: number, e: Enrollment) => sum + (e.totalLessons || 0), 0);
    const completedLessons = enrollments.reduce((sum: number, e: Enrollment) => sum + (e.completedLessons || 0), 0);
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum: number, e: Enrollment) => sum + (e.progressPercentage || 0), 0) / enrollments.length)
      : 0;

    return {
      enrolled: enrollments.length,
      active: active.length,
      completed: completed.length,
      totalLessons,
      completedLessons,
      avgProgress,
      totalPrograms,
    };
  }, [enrollments, totalPrograms]);

  // Sort enrollments by most recent activity
  const recentEnrollments = useMemo(() => {
    return [...enrollments]
      .sort((a: Enrollment, b: Enrollment) => {
        const dateA = a.lastAccessedAt || a.enrolledAt;
        const dateB = b.lastAccessedAt || b.enrolledAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [enrollments]);

  const isLoading = authLoading || enrollmentsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName || 'Member'}!
        </h1>
        <p className="text-muted-foreground">
          Role: {user?.role?.replace('_', ' ') || 'member'}.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Programs Enrolled"
          value={stats.enrolled}
          subtitle={`${stats.active} active`}
          icon={<BookOpen size={20} />}
          variant="primary"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          subtitle={`of ${stats.enrolled} enrolled`}
          icon={<CheckCircle2 size={20} />}
          variant="secondary"
        />
        <StatCard
          title="Lessons Completed"
          value={stats.completedLessons}
          subtitle={`of ${stats.totalLessons} total`}
          icon={<GraduationCap size={20} />}
          variant="accent"
        />
        <StatCard
          title="Avg. Progress"
          value={`${stats.avgProgress}%`}
          subtitle="across all programs"
          icon={<TrendingUp size={20} />}
          variant="default"
        />
      </div>

      {/* Two-column: Enrollments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* My Enrollments Table */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>My Enrollments</CardTitle>
                <CardDescription>Your current and recent programs</CardDescription>
              </div>
              <Link href="/enrollments" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {recentEnrollments.length === 0 ? (
              <EmptyState
                message="No enrollments yet"
                action={{ label: 'Browse Programs', href: '/programs' }}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left font-medium text-muted-foreground px-6 py-3">Program</th>
                      <th className="text-left font-medium text-muted-foreground px-6 py-3">Status</th>
                      <th className="text-left font-medium text-muted-foreground px-6 py-3">Progress</th>
                      <th className="text-left font-medium text-muted-foreground px-6 py-3">Lessons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((enrollment: Enrollment) => (
                      <tr
                        key={enrollment.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <Link
                            href={`/enrollments/${enrollment.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {enrollment.program?.title ?? 'Untitled Program'}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5">
                          <EnrollmentStatusBadge status={enrollment.status} />
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${enrollment.progressPercentage ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {enrollment.progressPercentage ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          {enrollment.completedLessons}/{enrollment.totalLessons}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into what matters</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickAction
              href="/programs"
              icon={<BookOpen size={18} />}
              title="Browse Programs"
              description={`${stats.totalPrograms} programs available`}
            />
            <QuickAction
              href="/enrollments"
              icon={<GraduationCap size={18} />}
              title="My Learning"
              description={`${stats.active} active enrollments`}
            />
            <QuickAction
              href="/community"
              icon={<MessageSquare size={18} />}
              title="Community"
              description="Connect with other members"
            />
            <QuickAction
              href="/settings/profile"
              icon={<Users size={18} />}
              title="Edit Profile"
              description="Complete your account setup"
            />
            {canManageSessions && (
              <QuickAction
                href="/coach/workspace"
                icon={<Calendar size={18} />}
                title="Coach Workspace"
                description="Manage mentee sessions and delivery"
              />
            )}
            {canOpenPartnerWorkspace && (
              <QuickAction
                href="/partner/workspace"
                icon={<Users size={18} />}
                title="Partner Workspace"
                description="Manage organizational activities"
              />
            )}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <QuickAction
                href="/admin"
                icon={<TrendingUp size={18} />}
                title="Admin Panel"
                description="Open governance and moderation tools"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: Enrollment Breakdown + Available Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enrollment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Overview</CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <EmptyState
                message="No enrollment data yet"
                action={{ label: 'Enroll in a Program', href: '/programs' }}
              />
            ) : (
              <>
                <div className="flex items-center justify-center py-4">
                  <EnrollmentDonut enrollments={enrollments} />
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      Active ({enrollments.filter((e: Enrollment) => e.status === 'ACTIVE').length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">
                      Completed ({enrollments.filter((e: Enrollment) => e.status === 'COMPLETED').length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground">
                      Other ({enrollments.filter((e: Enrollment) => !['ACTIVE', 'COMPLETED'].includes(e.status)).length})
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Programs from Catalog */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Explore Programs</CardTitle>
                <CardDescription>Discover something new</CardDescription>
              </div>
              <Link href="/programs" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {catalogLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (catalogData?.data ?? []).length === 0 ? (
              <EmptyState message="No programs available yet" />
            ) : (
              (catalogData?.data ?? []).slice(0, 4).map((program: any) => (
                <Link
                  key={program.id}
                  href={`/programs/${program.slug}`}
                  className="flex items-center gap-4 rounded-lg border border-border p-3 hover:border-primary hover:bg-muted/30 transition-all group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{program.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {program.difficulty?.toLowerCase() ?? 'All levels'}
                      {program.price ? ` · $${program.price}` : ' · Free'}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </Card>
  );
}

/* ─── Sub-components ─── */

const STAT_VARIANTS = {
  default: {
    card: 'bg-card border border-border',
    icon: 'bg-muted text-foreground',
    title: 'text-muted-foreground',
    value: 'text-foreground',
    subtitle: 'text-muted-foreground',
  },
  primary: {
    card: 'bg-primary text-primary-foreground border-0',
    icon: 'bg-primary-foreground/20 text-primary-foreground',
    title: 'opacity-80',
    value: '',
    subtitle: 'opacity-70 border-primary-foreground/20',
  },
  secondary: {
    card: 'bg-secondary text-secondary-foreground border-0',
    icon: 'bg-secondary-foreground/20 text-secondary-foreground',
    title: 'opacity-80',
    value: '',
    subtitle: 'opacity-70 border-secondary-foreground/20',
  },
  accent: {
    card: 'bg-accent text-accent-foreground border-0',
    icon: 'bg-accent-foreground/20 text-accent-foreground',
    title: 'opacity-80',
    value: '',
    subtitle: 'opacity-70 border-accent-foreground/20',
  },
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: React.ReactNode;
  variant?: keyof typeof STAT_VARIANTS;
}) {
  const s = STAT_VARIANTS[variant];
  return (
    <div className={`relative overflow-hidden rounded-xl p-6 transition-all hover:shadow-lg ${s.card}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-sm font-medium ${s.title}`}>{title}</p>
          <p className={`text-3xl font-bold tracking-tight ${s.value}`}>{value}</p>
          <p className={`text-sm ${s.subtitle}`}>{subtitle}</p>
        </div>
        {icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border p-3 hover:border-primary hover:bg-muted/30 transition-all group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Inbox size={32} className="text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-3 text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          {action.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
    ACTIVE: { variant: 'default', label: 'Active' },
    COMPLETED: { variant: 'secondary', label: 'Completed' },
    PAUSED: { variant: 'outline', label: 'Paused' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    EXPIRED: { variant: 'destructive', label: 'Expired' },
  };
  const config = variants[status] ?? { variant: 'outline' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function EnrollmentDonut({ enrollments }: { enrollments: Enrollment[] }) {
  const active = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const other = enrollments.length - active - completed;
  const total = enrollments.length;

  const circumference = 2 * Math.PI * 38; // r=38
  const activeArc = total > 0 ? (active / total) * circumference : 0;
  const completedArc = total > 0 ? (completed / total) * circumference : 0;
  const otherArc = total > 0 ? (other / total) * circumference : 0;

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />
        {activeArc > 0 && (
          <circle
            cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12"
            className="text-primary" strokeDasharray={`${activeArc} ${circumference - activeArc}`}
            strokeLinecap="round"
          />
        )}
        {completedArc > 0 && (
          <circle
            cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12"
            className="text-green-500" strokeDasharray={`${completedArc} ${circumference - completedArc}`}
            strokeDashoffset={`${-activeArc}`} strokeLinecap="round"
          />
        )}
        {otherArc > 0 && (
          <circle
            cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12"
            className="text-muted-foreground" strokeDasharray={`${otherArc} ${circumference - otherArc}`}
            strokeDashoffset={`${-(activeArc + completedArc)}`} strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">Enrolled</span>
      </div>
    </div>
  );
}
