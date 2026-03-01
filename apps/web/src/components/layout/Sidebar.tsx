'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  UserGroupIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/store';
import {
  ADMIN_ROLES,
  COACH_MANAGEMENT_ROLES,
  PARTNER_WORKSPACE_ROLES,
  type AppRole,
} from '@/lib/auth/rbac';

interface SidebarLink {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: AppRole[];
}

const sidebarLinks: SidebarLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'My Learning',
    href: '/enrollments',
    icon: BookOpenIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: AcademicCapIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Coaches',
    href: '/coaches',
    icon: UserGroupIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Sessions',
    href: '/sessions',
    icon: VideoCameraIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Coach Workspace',
    href: '/coach/workspace',
    icon: VideoCameraIcon,
    roles: COACH_MANAGEMENT_ROLES,
  },
  {
    label: 'Partner Workspace',
    href: '/partner/workspace',
    icon: UsersIcon,
    roles: PARTNER_WORKSPACE_ROLES,
  },
  {
    label: 'Certificates',
    href: '/certificates',
    icon: DocumentCheckIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Community',
    href: '/community',
    icon: UsersIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Events',
    href: '/events',
    icon: CalendarDaysIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: ChatBubbleLeftRightIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: ['member', 'partner', 'coach', 'admin', 'super_admin'],
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: ShieldCheckIcon,
    roles: ADMIN_ROLES,
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const userRole = useAuthStore((state) => state.user?.role ?? null) as AppRole | null;
  const effectiveRole: AppRole = userRole || 'member';

  const visibleLinks = sidebarLinks.filter((link) => link.roles.includes(effectiveRole));

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className={`text-xl font-bold font-heading text-sidebar-primary transition-all ${
            collapsed ? 'sr-only' : ''
          }`}
        >
          TBCN
        </Link>

        <button
          onClick={onToggle}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRightIcon className="h-5 w-5" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5" />
          )}
        </button>

        <button
          onClick={onMobileClose}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onMobileClose}
            title={collapsed ? link.label : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              collapsed ? 'justify-center' : ''
            } ${
              isActive(link.href)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <link.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <p className="text-xs text-sidebar-muted-foreground">
            &copy; {new Date().getFullYear()} TBCN
          </p>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      <aside
        className={`sticky top-0 hidden lg:flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
