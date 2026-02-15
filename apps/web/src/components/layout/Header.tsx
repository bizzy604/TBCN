import Link from 'next/link';
import Navigation from './Navigation';
import { HomeIcon } from '@heroicons/react/24/outline';

const navItems = [
  { label: 'Programs', href: '/programs' },
  { label: 'Coaches', href: '/coaches' },
  { label: 'Events', href: '/events' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
];

/**
 * Simple Header used on marketing pages.
 * Kept minimal to satisfy existing imports and styling.
 */
export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container-app flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <HomeIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-heading text-foreground">TBCN</span>
        </Link>

        <div className="hidden md:block">
          <Navigation items={navItems} />
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/register" className="btn btn-sm btn-primary">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
