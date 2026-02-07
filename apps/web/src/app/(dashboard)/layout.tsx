'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar Navigation */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-y-auto h-screen">
          {/* Top bar with breadcrumbs */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
            <div className="flex h-14 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
                  aria-label="Open navigation"
                >
                  <Bars3Icon className="h-5 w-5" />
                </button>
                <Breadcrumbs />
              </div>

              {/* User menu */}
              <div className="flex items-center gap-4">
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                  title="Account settings"
                >
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <span className="sr-only">Account settings</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
