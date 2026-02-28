'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const crumbLabels: Record<string, string> = {
  about: 'About Us',
  partners: 'Partners',
  contact: 'Contact',
  programs: 'Programs',
  coaches: 'Coaches',
  events: 'Events',
  pricing: 'Pricing',
  dashboard: 'Dashboard',
  learning: 'My Learning',
  coaching: 'Coaching',
  community: 'Community',
  messages: 'Messages',
  profile: 'Profile',
  settings: 'Settings',
  enrollments: 'Enrollments',
  lessons: 'Lessons',
  security: 'Security',
  subscription: 'Subscription',
  sessions: 'Sessions',
  notifications: 'Notifications',
  edit: 'Edit',
};

/** Check if a string looks like a UUID or dynamic slug */
function isDynamicSegment(seg: string) {
  return /^[0-9a-f]{8}-/.test(seg) || seg.length > 30;
}

/**
 * Breadcrumb navigation component
 * Auto-generates from the current URL path.
 * On small screens: collapses middle segments behind "â€¦"
 */
export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  // Build crumb objects
  const crumbs = segments.map((seg, idx) => ({
    href: '/' + segments.slice(0, idx + 1).join('/'),
    label: crumbLabels[seg] ?? (isDynamicSegment(seg) ? 'â€¦' : seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
    isLast: idx === segments.length - 1,
  }));

  // On mobile (handled via CSS), we show: Home / first / â€¦ / last
  // On desktop, show everything. We'll mark middle items as collapsible.
  const collapsible = crumbs.length > 2 ? crumbs.slice(1, -1) : [];

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-none">
        {/* Home â€” always visible */}
        <li className="shrink-0">
          <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">
            Home
          </Link>
        </li>

        {crumbs.map((crumb, idx) => {
          // Middle items on mobile get hidden when there are many crumbs
          const isMiddle = idx > 0 && idx < crumbs.length - 1;
          const isCollapsible = collapsible.length > 1 && isMiddle;
          // Show ellipsis right before the first hidden middle item
          const showEllipsis = isCollapsible && idx === 1;

          return (
            <li
              key={crumb.href}
              className="contents"
            >
              {/* Collapsed indicator â€” only on mobile, once before hidden middle items */}
              {showEllipsis && (
                <span className="flex sm:hidden items-center gap-1 sm:gap-2 shrink-0">
                  <span aria-hidden="true" className="text-muted-foreground/50">/</span>
                  <span className="text-muted-foreground">â€¦</span>
                </span>
              )}

              <span
                className={`flex items-center gap-1 sm:gap-2 shrink-0 ${
                  isCollapsible ? 'hidden sm:flex' : 'flex'
                }`}
              >
                <span aria-hidden="true" className="text-muted-foreground/50">/</span>
                {crumb.isLast ? (
                  <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-[160px] lg:max-w-none whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

