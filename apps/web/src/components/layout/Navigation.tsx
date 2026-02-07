'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
}

interface NavigationProps {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
}

/**
 * Reusable navigation links list
 * Can be used in Header, Sidebar, or Footer contexts
 */
export default function Navigation({
  items,
  className = '',
  onItemClick,
}: NavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className={className}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          onClick={onItemClick}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
