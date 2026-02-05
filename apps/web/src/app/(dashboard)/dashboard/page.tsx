'use client';

import { useAuth } from '@/hooks';
import Link from 'next/link';
import { BookOpen, Users, Calendar, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-primary-foreground">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'Coach'}!
        </h1>
        <p className="mt-2 text-primary-foreground/80 max-w-2xl">
          Continue your learning journey or explore new programs to grow your coaching business.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/dashboard/programs" className="btn-secondary bg-background text-primary hover:bg-muted">
            Browse Programs
          </Link>
          <Link href="/dashboard/profile" className="text-primary-foreground/90 hover:text-primary-foreground flex items-center gap-2">
            Complete your profile <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="text-primary" />}
          label="Programs Enrolled"
          value="3"
          change="+1 this month"
        />
        <StatCard
          icon={<Users className="text-secondary" />}
          label="Community Members"
          value="2,847"
          change="Active today"
        />
        <StatCard
          icon={<Calendar className="text-green-600" />}
          label="Upcoming Sessions"
          value="5"
          change="Next: Tomorrow"
        />
        <StatCard
          icon={<TrendingUp className="text-accent" />}
          label="Learning Progress"
          value="67%"
          change="Keep going!"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/dashboard/programs"
            icon={<BookOpen />}
            title="Continue Learning"
            description="Pick up where you left off"
          />
          <QuickAction
            href="/dashboard/coaching/book"
            icon={<Calendar />}
            title="Book a Session"
            description="Schedule 1-on-1 coaching"
          />
          <QuickAction
            href="/dashboard/community"
            icon={<MessageSquare />}
            title="Join Discussion"
            description="Connect with other coaches"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          <ActivityItem
            title="Completed: Module 3 - Brand Positioning"
            time="2 hours ago"
            type="lesson"
          />
          <ActivityItem
            title="New message from Coach Sarah"
            time="5 hours ago"
            type="message"
          />
          <ActivityItem
            title="Upcoming: Weekly Group Call"
            time="Tomorrow at 2:00 PM"
            type="event"
          />
          <ActivityItem
            title="Enrolled in: Advanced Marketing Strategies"
            time="3 days ago"
            type="enrollment"
          />
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{change}</p>
        </div>
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
      className="flex items-center gap-4 bg-card rounded-xl border border-border p-4 hover:border-primary hover:shadow-md transition-all group"
    >
      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function ActivityItem({
  title,
  time,
  type,
}: {
  title: string;
  time: string;
  type: 'lesson' | 'message' | 'event' | 'enrollment';
}) {
  const icons = {
    lesson: <BookOpen size={16} className="text-primary" />,
    message: <MessageSquare size={16} className="text-secondary" />,
    event: <Calendar size={16} className="text-green-600" />,
    enrollment: <TrendingUp size={16} className="text-accent" />,
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-muted">
      <div className="p-2 rounded-full bg-muted">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
