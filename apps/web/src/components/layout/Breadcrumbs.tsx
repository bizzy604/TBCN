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
};

/**
 * Breadcrumb navigation component
 * Auto-generates from the current URL path
 */
export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="container-app py-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
        </li>
        {segments.map((seg, idx) => {
          const href = '/' + segments.slice(0, idx + 1).join('/');
          const isLast = idx === segments.length - 1;
          const label = crumbLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);

          return (
            <li key={href} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link href={href} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
