'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  PieChart,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Users,
  UsersRound,
} from 'lucide-react';
import {
  adminAuthApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type AuthUser,
} from '@/lib/api/admin-api';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['coach', 'admin', 'super_admin'],
    phase2: false,
  },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Content',
    href: '/content-moderation',
    icon: ShieldCheck,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: BookOpen,
    roles: ['coach', 'admin', 'super_admin'],
    phase2: false,
  },
  {
    label: 'Events',
    icon: UsersRound,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Store',
    href: '/transactions',
    icon: ShoppingBag,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['coach', 'admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Partners',
    href: '/partners',
    icon: PieChart,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'Support',
    icon: LifeBuoy,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
  {
    label: 'System',
    href: '/settings',
    icon: Settings2,
    roles: ['admin', 'super_admin'],
    phase2: true,
  },
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

  const pageTitle = (() => {
    if (pathname.startsWith('/programs/new')) return 'Program Builder';
    if (pathname.startsWith('/programs/') && pathname.endsWith('/edit')) return 'Edit Program';
    if (pathname.startsWith('/programs/')) return 'Program Details';
    if (pathname.startsWith('/programs')) return 'Programs';
    if (pathname.startsWith('/users')) return 'User Management';
    if (pathname.startsWith('/content-moderation')) return 'Content Approval Queue';
    if (pathname.startsWith('/transactions')) return 'Store Management';
    if (pathname.startsWith('/analytics')) return 'Platform Analytics';
    if (pathname.startsWith('/partners')) return 'Partners';
    if (pathname.startsWith('/settings')) return 'System';
    return 'Admin Dashboard';
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/55 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-72 flex-col bg-sidebar border-r border-sidebar-border
            transition-transform duration-200 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:flex
          `}
        >
          <div className="border-b border-sidebar-border px-5 pb-4 pt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
              The Brand Coach Network
            </p>
            <p className="mt-2 text-xl font-semibold text-sidebar-foreground">Admin Portal</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href ? isActive(item.href) : false;
              const className = cn(
                'admin-nav-link',
                active && 'admin-nav-link-active',
                !item.href && 'cursor-not-allowed opacity-60',
              );

              if (!item.href) {
                return (
                  <div key={item.label} className={className}>
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.phase2 && (
                      <span className="rounded-full border border-sidebar-foreground/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        P2
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.phase2 && !active && (
                    <span className="rounded-full border border-sidebar-foreground/30 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                      P2
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info + Logout */}
          <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
            {user && (
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/20 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold uppercase">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs uppercase tracking-wide text-sidebar-foreground/70">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => adminAuthApi.logout()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/20 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:pl-72">
          <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card md:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Admin Console
                  </p>
                  <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                    {pageTitle}
                  </h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <span className="admin-chip border-secondary/35 bg-secondary/10 text-secondary">
                  {isPlatformAdmin ? 'Platform Admin' : 'Coach Workspace'}
                </span>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
