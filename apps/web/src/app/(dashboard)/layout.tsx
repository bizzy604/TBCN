'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import {
  Bars3Icon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useUnreadNotificationsCount } from '@/hooks/use-engagement';
import { useNotificationsRealtime } from '@/hooks';

const mobileTabs = [
  { label: 'Home', href: '/dashboard', icon: HomeIcon },
  { label: 'Learning', href: '/enrollments', icon: BookOpenIcon },
  { label: 'Community', href: '/community', icon: UserGroupIcon },
  { label: 'Events', href: '/events', icon: CalendarDaysIcon },
  { label: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useNotificationsRealtime();
  const { data: unreadData } = useUnreadNotificationsCount();
  const unreadCount = unreadData?.unread ?? 0;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div className="flex h-screen flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground lg:hidden"
                  aria-label="Open navigation"
                  type="button"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
                <Breadcrumbs />
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/notifications"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition hover:bg-muted/55"
                  title="Notifications"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-primary px-1 text-center text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/settings/profile"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/55"
                >
                  Account
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">{children}</main>
        </div>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {mobileTabs.map((tab) => {
            const active = tab.href === '/dashboard' ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`flex min-h-11 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/55'
                  }`}
                >
                  <tab.icon className="mb-0.5 h-4 w-4" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </ProtectedRoute>
  );
}
