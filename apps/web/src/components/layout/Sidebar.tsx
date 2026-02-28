'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from '@heroicons/react/24/outline';

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'My Learning', href: '/enrollments', icon: BookOpenIcon },
  { label: 'Programs', href: '/programs', icon: AcademicCapIcon },
  { label: 'Coaches', href: '/coaches', icon: UserGroupIcon },
  { label: 'Sessions', href: '/sessions', icon: VideoCameraIcon },
  { label: 'Certificates', href: '/certificates', icon: DocumentCheckIcon },
  { label: 'Community', href: '/community', icon: UsersIcon },
  { label: 'Events', href: '/events', icon: CalendarDaysIcon },
  { label: 'Messages', href: '/messages', icon: ChatBubbleLeftRightIcon },
  { label: 'Notifications', href: '/notifications', icon: BellIcon },
  { label: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * Sidebar navigation for authenticated/dashboard pages.
 * Supports collapsed state on desktop and slide-over on mobile.
 */
export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className={`text-xl font-bold font-heading text-sidebar-primary transition-all ${collapsed ? 'sr-only' : ''}`}>
          TBCN
        </Link>
        {/* Collapse toggle â€” desktop only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
        {/* Close button â€” mobile only */}
        <button
          onClick={onMobileClose}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarLinks.map((link) => (
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

      {/* Footer */}
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
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile slide-over sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
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

