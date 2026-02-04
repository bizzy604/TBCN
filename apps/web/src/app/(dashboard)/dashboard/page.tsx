'use client';

import { useAuth } from '@/hooks';
import Link from 'next/link';
import { BookOpen, Users, Calendar, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || 'Coach'}!
        </h1>
        <p className="mt-2 text-white/80 max-w-2xl">
          Continue your learning journey or explore new programs to grow your coaching business.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href="/dashboard/programs" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
            Browse Programs
          </Link>
          <Link href="/dashboard/profile" className="text-white/90 hover:text-white flex items-center gap-2">
            Complete your profile <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<BookOpen className="text-primary-600" />}
          label="Programs Enrolled"
          value="3"
          change="+1 this month"
        />
        <StatCard
          icon={<Users className="text-purple-600" />}
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
          icon={<TrendingUp className="text-orange-600" />}
          label="Learning Progress"
          value="67%"
          change="Keep going!"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
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
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-gray-50">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{change}</p>
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
      className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-500 hover:shadow-md transition-all group"
    >
      <div className="p-3 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100">
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
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
    lesson: <BookOpen size={16} className="text-primary-600" />,
    message: <MessageSquare size={16} className="text-purple-600" />,
    event: <Calendar size={16} className="text-green-600" />,
    enrollment: <TrendingUp size={16} className="text-orange-600" />,
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
      <div className="p-2 rounded-full bg-gray-100">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );
}
