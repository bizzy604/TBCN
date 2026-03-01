'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  adminAuthApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type AuthUser,
} from '@/lib/api/admin-api';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', roles: ['coach', 'admin', 'super_admin'] },
  { href: '/analytics', label: 'Analytics', roles: ['coach', 'admin', 'super_admin'] },
  { href: '/programs', label: 'Programs', roles: ['coach', 'admin', 'super_admin'] },
  { href: '/users', label: 'Users', roles: ['admin', 'super_admin'] },
  { href: '/transactions', label: 'Transactions', roles: ['admin', 'super_admin'] },
  { href: '/settings', label: 'Settings', roles: ['admin', 'super_admin'] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Read cached user from cookie for fast role-aware navigation rendering.
    setUser(getAdminUserFromCookie());
  }, []);

  const isPlatformAdmin = user
    ? PLATFORM_ADMIN_ROLES.includes(user.role as (typeof PLATFORM_ADMIN_ROLES)[number])
    : false;
  const navItems = NAV_ITEMS.filter((item) => {
    if (!user) {
      return item.roles.includes('coach');
    }
    return item.roles.includes(user.role);
  });

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 flex-col bg-sidebar border-r border-sidebar-border
            transition-transform duration-200 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:flex
          `}
        >
          <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
            <span className="font-semibold text-lg text-sidebar-foreground">TBCN Admin</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* User info + Logout */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3 px-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => adminAuthApi.logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:pl-64">
          <header className="h-16 border-b border-border flex items-center px-6 bg-background sticky top-0 z-10">
            {/* Mobile menu button */}
            <button
              className="mr-4 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <h1 className="font-semibold text-foreground">
              {isPlatformAdmin ? 'Admin Dashboard' : 'Coach Dashboard'}
            </h1>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
