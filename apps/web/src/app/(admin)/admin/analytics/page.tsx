'use client';

import { useAdminActivity, useAdminOverview } from '@/hooks/use-analytics';

export default function AdminAnalyticsPage() {
  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: activity, isLoading: loadingActivity } = useAdminActivity(25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Real-time admin metrics and recent activity feed.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="Users" value={loadingOverview ? '...' : String(overview?.usersTotal ?? 0)} />
        <MetricCard label="Revenue" value={loadingOverview ? '...' : `$${(overview?.revenueTotal ?? 0).toFixed(2)}`} />
        <MetricCard label="Transactions" value={loadingOverview ? '...' : String(overview?.transactionsTotal ?? 0)} />
        <MetricCard label="Events" value={loadingOverview ? '...' : String(overview?.eventsTotal ?? 0)} />
        <MetricCard label="Conversion" value={loadingOverview ? '...' : `${(overview?.conversionRate ?? 0).toFixed(2)}%`} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {loadingActivity ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading activity...</p>
        ) : !activity?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">No recent activity available.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {activity.map((item, i) => (
              <div key={`${item.type}-${i}`} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
