'use client';

import { useAuth } from '@/hooks';
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  UserPlus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="text-primary" />}
          label="Total Users"
          value="5,234"
          change="+12.5%"
          trend="up"
        />
        <StatCard
          icon={<BookOpen className="text-secondary" />}
          label="Active Programs"
          value="24"
          change="+4"
          trend="up"
        />
        <StatCard
          icon={<CreditCard className="text-green-600" />}
          label="Revenue (MTD)"
          value="$48,290"
          change="+8.2%"
          trend="up"
        />
        <StatCard
          icon={<TrendingUp className="text-accent" />}
          label="Conversion Rate"
          value="3.2%"
          change="-0.4%"
          trend="down"
        />
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sign-ups */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Sign-ups</h2>
            <a href="/admin/users" className="text-sm text-primary hover:text-primary/80">
              View all
            </a>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', email: 'sarah@example.com', time: '2 min ago' },
              { name: 'Michael Chen', email: 'michael@example.com', time: '15 min ago' },
              { name: 'Emily Davis', email: 'emily@example.com', time: '1 hour ago' },
              { name: 'James Wilson', email: 'james@example.com', time: '3 hours ago' },
              { name: 'Lisa Anderson', email: 'lisa@example.com', time: '5 hours ago' },
            ].map((user, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <UserPlus size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">{user.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <a href="/admin/analytics" className="text-sm text-primary hover:text-primary/80">
              View all
            </a>
          </div>
          <div className="space-y-4">
            {[
              { action: 'New program published', details: 'Advanced Marketing Mastery', time: '5 min ago', type: 'success' },
              { action: 'Payment received', details: '$499.00 from John Doe', time: '12 min ago', type: 'success' },
              { action: 'Support ticket opened', details: 'Login issue reported', time: '30 min ago', type: 'warning' },
              { action: 'Content flagged', details: 'Community post reported', time: '1 hour ago', type: 'error' },
              { action: 'Coaching session completed', details: 'Sarah with Coach Mike', time: '2 hours ago', type: 'success' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-destructive'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction href="/admin/users/new" icon={<UserPlus />} label="Add User" />
          <QuickAction href="/admin/programs/new" icon={<BookOpen />} label="Create Program" />
          <QuickAction href="/admin/analytics" icon={<Activity />} label="View Reports" />
          <QuickAction href="/admin/moderation" icon={<Activity />} label="Review Content" />
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
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-destructive'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
    >
      <div className="p-3 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium text-foreground group-hover:text-primary">
        {label}
      </span>
    </a>
  );
}
