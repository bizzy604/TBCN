'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const labels: Record<string, string> = {
  admin: 'Admin',
  analytics: 'Analytics',
  certificates: 'Certificates',
  coaches: 'Coaches',
  community: 'Community',
  dashboard: 'Dashboard',
  enrollments: 'My Learning',
  events: 'Events',
  messages: 'Messages',
  notifications: 'Notifications',
  orders: 'Orders',
  payments: 'Payments',
  profile: 'Profile',
  programs: 'Programs',
  settings: 'Settings',
  sessions: 'Sessions',
  store: 'Store',
  subscription: 'Subscription',
  users: 'Users',
};

function pretty(segment: string): string {
  if (labels[segment]) {
    return labels[segment];
  }
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const crumbs = segments.map((segment, index) => ({
    href: '/' + segments.slice(0, index + 1).join('/'),
    label: pretty(segment),
    current: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex items-center gap-2 overflow-x-auto text-xs text-muted-foreground sm:text-sm">
        <li className="shrink-0">
          <Link href="/" className="rounded-md px-1 hover:text-foreground">
            Home
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex shrink-0 items-center gap-2">
            <span className="text-muted-foreground/45">/</span>
            {crumb.current ? (
              <span className="max-w-[170px] truncate font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="max-w-[150px] truncate rounded-md px-1 hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
