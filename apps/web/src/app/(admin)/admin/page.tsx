'use client';

import { useAuth } from '@/hooks';
import { useAdminActivity, useAdminOverview } from '@/hooks/use-analytics';
import type { ReactNode } from 'react';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Calendar,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data: metrics, isLoading: loadingMetrics } = useAdminOverview();
  const { data: activity, isLoading: loadingActivity } = useAdminActivity(10);

  const cards: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    change: string;
    trend: 'up' | 'down';
  }> = [
    {
      icon: <Users className="text-primary" />,
      label: 'Total Users',
      value: metrics?.usersTotal ?? 0,
      change: `${metrics?.usersActive ?? 0} active`,
      trend: 'up' as const,
    },
    {
      icon: <BookOpen className="text-secondary" />,
      label: 'Published Programs',
      value: metrics?.programsPublished ?? 0,
      change: `${metrics?.programsTotal ?? 0} total`,
      trend: 'up' as const,
    },
    {
      icon: <CreditCard className="text-green-600" />,
      label: 'Revenue',
      value: `$${(metrics?.revenueTotal ?? 0).toFixed(2)}`,
      change: `${metrics?.transactionsTotal ?? 0} successful tx`,
      trend: 'up' as const,
    },
    {
      icon: <TrendingUp className="text-accent" />,
      label: 'Conversion Rate',
      value: `${(metrics?.conversionRate ?? 0).toFixed(2)}%`,
      change: `${metrics?.enrollmentsTotal ?? 0} enrollments`,
      trend: (metrics?.conversionRate ?? 0) >= 2 ? 'up' : 'down',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}. Here are the latest platform metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            value={loadingMetrics ? '...' : String(card.value)}
            change={card.change}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <a href="/admin/analytics" className="text-sm text-primary hover:text-primary/80">
              View all
            </a>
          </div>

          {loadingActivity ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 animate-pulse rounded-lg bg-muted/40" />
              ))}
            </div>
          ) : !activity?.length ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {activity.map((item, index) => (
                <div key={`${item.type}-${index}`} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricChip icon={<MessageSquare size={16} />} label="Posts" value={metrics?.communityPostsTotal ?? 0} />
            <MetricChip icon={<Calendar size={16} />} label="Events" value={metrics?.eventsTotal ?? 0} />
            <MetricChip icon={<Users size={16} />} label="Users" value={metrics?.usersTotal ?? 0} />
            <MetricChip icon={<Activity size={16} />} label="Enrollments" value={metrics?.enrollmentsTotal ?? 0} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <QuickAction href="/admin/programs/new" label="Create Program" />
            <QuickAction href="/admin/users" label="Manage Users" />
            <QuickAction href="/admin/moderation" label="Moderation" />
            <QuickAction href="/admin/analytics" label="Reports" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  trend,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-muted p-2">{icon}</div>
        <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-destructive'}`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function MetricChip({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-border px-3 py-2 text-center text-sm font-medium hover:border-primary hover:bg-primary/5"
    >
      {label}
    </a>
  );
}
