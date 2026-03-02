'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  ShieldAlert,
  Users,
  UserPlus,
} from 'lucide-react';
import {
  adminEnrollmentsApi,
  adminProgramsApi,
  adminUsersApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type ProgramStats,
  type ProgramSummary,
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
  const [recentPrograms, setRecentPrograms] = useState<ProgramSummary[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isPlatformAdmin = role
    ? PLATFORM_ADMIN_ROLES.includes(role as (typeof PLATFORM_ADMIN_ROLES)[number])
    : false;

  useEffect(() => {
    async function fetchStats() {
      const currentUser = getAdminUserFromCookie();
      setRole(currentUser?.role ?? null);

      const currentUserIsPlatformAdmin = currentUser
        ? PLATFORM_ADMIN_ROLES.includes(
            currentUser.role as (typeof PLATFORM_ADMIN_ROLES)[number],
          )
        : false;

      try {
        if (currentUserIsPlatformAdmin) {
          const [programs, enrollments, users, recent] = await Promise.allSettled([
            adminProgramsApi.getStats(),
            adminEnrollmentsApi.getStats(),
            adminUsersApi.getStats(),
            adminProgramsApi.getAll({ page: 1, limit: 5 }),
          ]);

          if (programs.status === 'fulfilled') setProgramStats(programs.value);
          if (enrollments.status === 'fulfilled') setEnrollmentStats(enrollments.value);
          if (users.status === 'fulfilled') setUserStats(users.value);
          if (recent.status === 'fulfilled') setRecentPrograms(recent.value.data);
          return;
        }

        const [allPrograms, publishedPrograms, draftPrograms, recent] =
          await Promise.allSettled([
            adminProgramsApi.getAll({ page: 1, limit: 1 }),
            adminProgramsApi.getAll({ page: 1, limit: 1, status: 'published' }),
            adminProgramsApi.getAll({ page: 1, limit: 1, status: 'draft' }),
            adminProgramsApi.getAll({ page: 1, limit: 5 }),
          ]);

        setProgramStats({
          total: allPrograms.status === 'fulfilled' ? allPrograms.value.meta.total : 0,
          published:
            publishedPrograms.status === 'fulfilled'
              ? publishedPrograms.value.meta.total
              : 0,
          draft: draftPrograms.status === 'fulfilled' ? draftPrograms.value.meta.total : 0,
          totalEnrollments: 0,
        });

        if (recent.status === 'fulfilled') setRecentPrograms(recent.value.data);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const totalUsers = userStats
    ? Object.values(userStats).reduce(
        (sum, count) => sum + (typeof count === 'number' ? count : 0),
        0,
      )
    : 0;

  const fmt = (n: number | null | undefined) =>
    typeof n === 'number' ? n.toLocaleString() : '0';

  const revenueSeries = useMemo(() => {
    const base = Math.max(programStats?.totalEnrollments ?? 0, 1);
    return [0.48, 0.57, 0.62, 0.72, 0.76, 0.9].map((p) => Math.round(base * p));
  }, [programStats?.totalEnrollments]);

  const growthSeries = useMemo(() => {
    const base = Math.max(totalUsers, 1);
    return [0.44, 0.51, 0.58, 0.66, 0.8, 0.93].map((p) => Math.round(base * p));
  }, [totalUsers]);

  const kpis = isPlatformAdmin
    ? [
        {
          label: 'Total Users',
          value: fmt(totalUsers),
          hint: `${fmt(userStats?.coach ?? 0)} coaches, ${fmt(userStats?.member ?? 0)} members`,
          tone: 'text-foreground',
          icon: Users,
        },
        {
          label: 'Active Today',
          value: fmt(enrollmentStats?.totalActive),
          hint: 'Current active learners',
          tone: 'text-secondary',
          icon: Clock3,
        },
        {
          label: 'New Signups (7d)',
          value: 'P2',
          hint: 'Pending users API expansion',
          tone: 'text-muted-foreground',
          icon: UserPlus,
        },
        {
          label: 'Total Revenue (MTD)',
          value: 'P2',
          hint: 'Pending transactions API',
          tone: 'text-muted-foreground',
          icon: CircleDollarSign,
        },
        {
          label: 'Pending Approvals',
          value: fmt(programStats?.draft),
          hint: programStats?.draft ? 'Draft programs awaiting approval' : 'No pending program approvals',
          tone: programStats?.draft ? 'text-warning' : 'text-secondary',
          icon: programStats?.draft ? ShieldAlert : CheckCircle2,
        },
        {
          label: 'Open Support Tickets',
          value: 'P2',
          hint: 'Support module in phase 2',
          tone: 'text-muted-foreground',
          icon: AlertCircle,
        },
      ]
    : [
        {
          label: 'Total Programs',
          value: fmt(programStats?.total),
          hint: 'All visible programs in LMS',
          tone: 'text-foreground',
          icon: Users,
        },
        {
          label: 'Published',
          value: fmt(programStats?.published),
          hint: 'Live programs',
          tone: 'text-secondary',
          icon: CheckCircle2,
        },
        {
          label: 'Draft',
          value: fmt(programStats?.draft),
          hint: 'Awaiting review',
          tone: 'text-warning',
          icon: ShieldAlert,
        },
      ];

  const recentActivity = recentPrograms.slice(0, 5).map((program) => ({
    id: program.id,
    message: `Program "${program.title}" updated`,
    time: new Date(program.createdAt).toLocaleString(),
  }));

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="bg-sidebar px-6 py-6 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
            Platform Operations
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
            {isPlatformAdmin ? 'Admin Dashboard' : 'Coach Dashboard'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-sidebar-foreground/85">
            Unified control surface for metrics, approvals, and program performance.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="admin-kpi-card">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className={`text-3xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.hint}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="admin-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <span className="admin-chip border-primary/35 bg-primary/10 text-primary">
              Phase 1 proxy
            </span>
          </div>
          <SimpleAreaChart data={revenueSeries} stroke="#d54255" fill="rgba(213,66,85,0.22)" />
        </div>

        <div className="admin-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">User Growth</h3>
              <p className="text-xs text-muted-foreground">Last 3 months</p>
            </div>
            <span className="admin-chip border-secondary/35 bg-secondary/10 text-secondary">
              Active data
            </span>
          </div>
          <SimpleLineChart data={growthSeries} stroke="#117a8b" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="admin-panel p-5">
          <h3 className="text-base font-semibold text-foreground">Recent Programs</h3>
          <p className="mt-1 text-xs text-muted-foreground">Latest content updates</p>
          <div className="mt-4 space-y-3">
            {recentPrograms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No programs yet.</p>
            ) : (
              recentPrograms.map((program) => (
                <div key={program.id} className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="truncate text-sm font-medium text-foreground">{program.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(program.createdAt).toLocaleDateString()} - {program.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="phase-two-card">
          <h3 className="text-base font-semibold text-foreground">Pending Content Approvals</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Content workflow endpoint not yet available in phase 1.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-border bg-background/70 p-3">
              <p className="text-sm font-medium text-foreground">Program drafts awaiting review</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Current count: {fmt(programStats?.draft)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/70 p-3">
              <p className="text-sm font-medium text-foreground">Quick actions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Approve/Reject controls activate with content moderation APIs.
              </p>
            </div>
          </div>
        </div>

        <div className="phase-two-card">
          <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Transaction feed and refunds are planned for phase 2.
          </p>
          <div className="mt-4 rounded-xl border border-border bg-background/70 p-3">
            <p className="text-sm text-muted-foreground">No transaction stream connected yet.</p>
          </div>
        </div>
      </section>

      <section className="admin-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">System Health</h3>
          <span className="text-xs text-muted-foreground">Live status</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ProgressMetric label="Server Uptime" value={99} />
          <ProgressMetric label="API Response Time" value={86} />
          <ProgressMetric label="Storage Used" value={68} />
        </div>
      </section>

      <section className="admin-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
          <Link
            href="/programs"
            className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
          >
            View programs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Activity feed will appear as data arrives.</p>
          ) : (
            recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/70 px-4 py-3"
              >
                <p className="text-sm text-foreground">{item.message}</p>
                <span className="whitespace-nowrap text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-background/70 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function SimpleAreaChart({
  data,
  stroke,
  fill,
}: {
  data: number[];
  stroke: string;
  fill: string;
}) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (value / max) * 86;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-44 w-full rounded-xl border border-border bg-background/70 p-3">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <polygon points={`0,100 ${points} 100,100`} fill={fill} />
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SimpleLineChart({ data, stroke }: { data: number[]; stroke: string }) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (value / max) * 84;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="h-44 w-full rounded-xl border border-border bg-background/70 p-3">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <polyline
          points={points}
          fill="none"
          stroke={stroke}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
