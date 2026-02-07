'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const sidebarLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'My Learning', href: '/dashboard/learning', icon: BookOpenIcon },
  { label: 'Coaching', href: '/dashboard/coaching', icon: AcademicCapIcon },
  { label: 'Community', href: '/dashboard/community', icon: UsersIcon },
  { label: 'Events', href: '/dashboard/events', icon: CalendarDaysIcon },
  { label: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftRightIcon },
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { label: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

/**
 * Sidebar navigation for authenticated/dashboard pages
 */
export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="text-xl font-bold font-heading text-sidebar-primary">
          TBCN
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-muted-foreground">
          &copy; {new Date().getFullYear()} TBCN
        </p>
      </div>
    </aside>
  );
}
