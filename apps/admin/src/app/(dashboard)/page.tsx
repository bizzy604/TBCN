'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  ArrowRight,
  Loader2,
  Inbox,
  Settings,
  ShieldCheck,
  UserPlus,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import {
  adminProgramsApi,
  adminEnrollmentsApi,
  adminUsersApi,
  type ProgramStats,
} from '@/lib/api/admin-api';

interface EnrollmentStats {
  totalActive: number;
  totalCompleted: number;
  totalDropped: number;
}

interface UserStats {
  [role: string]: number;
}

export default function DashboardPage() {
  const [programStats, setProgramStats] = useState<ProgramStats | null>(null);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [programs, enrollments, users] = await Promise.allSettled([
          adminProgramsApi.getStats(),
          adminEnrollmentsApi.getStats(),
          adminUsersApi.getStats(),
        ]);
        if (programs.status === 'fulfilled') setProgramStats(programs.value);
        if (enrollments.status === 'fulfilled') setEnrollmentStats(enrollments.value);
        if (users.status === 'fulfilled') setUserStats(users.value);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const totalUsers = userStats
    ? Object.values(userStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
    : 0;

  const fmt = (n: number | null | undefined) => (typeof n === 'number' ? n.toLocaleString() : '0');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={fmt(totalUsers)}
            description={`${fmt(userStats?.coach ?? 0)} coaches · ${fmt(userStats?.member ?? 0)} members`}
            icon={Users}
            variant="primary"
          />
          <DashboardCard
            title="Active Enrollments"
            value={fmt(enrollmentStats?.totalActive)}
            description={`${fmt(enrollmentStats?.totalCompleted)} completed`}
            icon={GraduationCap}
            variant="secondary"
          />
          <DashboardCard
            title="Published Programs"
            value={programStats?.published?.toString() ?? '0'}
            description={`${programStats?.draft ?? 0} drafts · ${programStats?.total ?? 0} total`}
            icon={BookOpen}
            variant="accent"
          />
          <DashboardCard
            title="Total Enrollments"
            value={fmt(programStats?.totalEnrollments)}
            description={`${enrollmentStats?.totalDropped ?? 0} dropped`}
            icon={BarChart3}
            variant="default"
          />
        </div>

        {/* Two-column: User Breakdown + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* User Breakdown */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Breakdown</CardTitle>
                  <CardDescription>Users by role</CardDescription>
                </div>
                <Link href="/users" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!userStats || totalUsers === 0 ? (
                <EmptyState message="No user data available" />
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Members', key: 'member', color: 'bg-primary' },
                    { label: 'Coaches', key: 'coach', color: 'bg-green-500' },
                    { label: 'Partners', key: 'partner', color: 'bg-blue-500' },
                    { label: 'Admins', key: 'admin', color: 'bg-orange-500' },
                    { label: 'Super Admins', key: 'super_admin', color: 'bg-red-500' },
                  ].map(({ label, key, color }) => {
                    const count = userStats[key] ?? 0;
                    const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{fmt(count)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <QuickAction
                href="/programs/new"
                icon={<FileText size={18} />}
                title="Create Program"
                description="Add a new learning program"
              />
              <QuickAction
                href="/users"
                icon={<UserPlus size={18} />}
                title="Manage Users"
                description={`${fmt(totalUsers)} registered users`}
              />
              <QuickAction
                href="/content-moderation"
                icon={<ShieldCheck size={18} />}
                title="Content Moderation"
                description="Review flagged content"
              />
              <QuickAction
                href="/settings"
                icon={<Settings size={18} />}
                title="Platform Settings"
                description="Configure system preferences"
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Programs Overview + System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Programs Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Programs Overview</CardTitle>
                  <CardDescription>Status distribution</CardDescription>
                </div>
                <Link href="/programs" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!programStats || programStats.total === 0 ? (
                <EmptyState
                  message="No programs yet"
                  action={{ label: 'Create Program', href: '/programs/new' }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-4">
                    <ProgramDonut stats={programStats} />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">Published ({programStats.published})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                      <span className="text-muted-foreground">Draft ({programStats.draft})</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Overview</CardTitle>
              <CardDescription>Current enrollment status</CardDescription>
            </CardHeader>
            <CardContent>
              {!enrollmentStats ? (
                <EmptyState message="No enrollment data available" />
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Active', value: enrollmentStats.totalActive, color: 'bg-primary' },
                    { label: 'Completed', value: enrollmentStats.totalCompleted, color: 'bg-green-500' },
                    { label: 'Dropped', value: enrollmentStats.totalDropped ?? 0, color: 'bg-red-500' },
                  ].map(({ label, value, color }) => {
                    const total =
                      enrollmentStats.totalActive +
                      enrollmentStats.totalCompleted +
                      (enrollmentStats.totalDropped ?? 0);
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">{fmt(value)}</span>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      {fmt(
                        enrollmentStats.totalActive +
                          enrollmentStats.totalCompleted +
                          (enrollmentStats.totalDropped ?? 0)
                      )}{' '}
                      total enrollments
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}

/* ─── Sub-components ─── */

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

function ProgramDonut({ stats }: { stats: ProgramStats }) {
  const { published, draft, total } = stats;
  const circumference = 2 * Math.PI * 38;
  const publishedArc = total > 0 ? (published / total) * circumference : 0;
  const draftArc = total > 0 ? (draft / total) * circumference : 0;

  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />
        {publishedArc > 0 && (
          <circle
            cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12"
            className="text-primary" strokeDasharray={`${publishedArc} ${circumference - publishedArc}`}
            strokeLinecap="round"
          />
        )}
        {draftArc > 0 && (
          <circle
            cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="12"
            className="text-muted-foreground" strokeDasharray={`${draftArc} ${circumference - draftArc}`}
            strokeDashoffset={`${-publishedArc}`} strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-xs text-muted-foreground">Programs</span>
      </div>
    </div>
  );
}
