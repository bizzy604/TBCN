export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="rounded-xl p-6 bg-primary text-primary-foreground">
          <p className="text-sm font-medium opacity-80">Total Users</p>
          <p className="text-3xl font-bold mt-2">12,485</p>
          <p className="text-sm mt-2 opacity-70">+12.5% vs last month</p>
        </div>
        <div className="rounded-xl p-6 bg-secondary text-secondary-foreground">
          <p className="text-sm font-medium opacity-80">Revenue (MTD)</p>
          <p className="text-3xl font-bold mt-2">$48,352</p>
          <p className="text-sm mt-2 opacity-70">+8.2% vs last month</p>
        </div>
        <div className="rounded-xl p-6 bg-accent text-accent-foreground">
          <p className="text-sm font-medium opacity-80">Active Programs</p>
          <p className="text-3xl font-bold mt-2">24</p>
          <p className="text-sm mt-2 opacity-70">+4 new this month</p>
        </div>
        <div className="rounded-xl p-6 bg-card border border-border">
          <p className="text-sm font-medium text-muted-foreground">Active Coaches</p>
          <p className="text-3xl font-bold mt-2 text-foreground">186</p>
          <p className="text-sm mt-2 text-muted-foreground">+15% vs last month</p>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart will be loaded here
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">API Server</span>
              <span className="text-sm text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">Database</span>
              <span className="text-sm text-green-500">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm">CDN</span>
              <span className="text-sm text-green-500">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
