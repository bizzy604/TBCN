'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import {
  AcademicCapIcon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentCheckIcon,
  HomeIcon,
  QueueListIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  UsersIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/store';
import {
  ADMIN_ROLES,
  COACH_MANAGEMENT_ROLES,
  PARTNER_WORKSPACE_ROLES,
  type AppRole,
} from '@/lib/auth/rbac';
import BrandLogo from '@/components/shared/BrandLogo';

interface SidebarLink {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  roles: AppRole[];
}

const sidebarLinks: SidebarLink[] = [
  { label: 'Home', href: '/dashboard', icon: HomeIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'My Learning', href: '/enrollments', icon: BookOpenIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Programs', href: '/programs', icon: AcademicCapIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Community', href: '/community', icon: UsersIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Events', href: '/events', icon: CalendarDaysIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Store', href: '/store', icon: ShoppingBagIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Orders', href: '/orders', icon: QueueListIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Coaches', href: '/coaches', icon: UserGroupIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Sessions', href: '/sessions', icon: VideoCameraIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Coach Workspace', href: '/coach/workspace', icon: VideoCameraIcon, roles: COACH_MANAGEMENT_ROLES },
  { label: 'Partner Workspace', href: '/partner/workspace', icon: UserGroupIcon, roles: PARTNER_WORKSPACE_ROLES },
  { label: 'Certificates', href: '/certificates', icon: DocumentCheckIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Notifications', href: '/notifications', icon: BellIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['member', 'partner', 'coach', 'admin', 'super_admin'] },
  { label: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon, roles: ADMIN_ROLES },
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

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2 overflow-hidden transition-all ${collapsed ? 'w-0 opacity-0 lg:w-auto lg:opacity-100' : 'w-auto opacity-100'}`}
        >
          <BrandLogo
            size={36}
            title={collapsed ? undefined : 'TBCN'}
            subtitle={collapsed ? undefined : 'Member Area'}
            imageWrapperClassName="ring-sidebar-border bg-sidebar-accent/30"
            titleClassName="text-sm font-semibold text-sidebar-foreground"
            subtitleClassName="text-[10px] uppercase tracking-[0.14em] text-sidebar-muted-foreground"
          />
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={onMobileClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent lg:hidden"
            aria-label="Close sidebar"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              title={collapsed ? link.label : undefined}
              className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2' : ''
              } ${
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <p className="text-xs text-sidebar-muted-foreground">Everyone is a Brand</p>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" aria-hidden="true" onClick={onMobileClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      <aside
        className={`sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 lg:flex ${
          collapsed ? 'w-[84px]' : 'w-72'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
