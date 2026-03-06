import Link from 'next/link';

const navItems = [
  { label: 'Programs', href: '/#featured-programs' },
  { label: 'Coaches', href: '/#coach-directory' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Partners', href: '/partners' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 text-foreground backdrop-blur dark:border-sidebar-border dark:bg-sidebar dark:text-sidebar-foreground/95">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            T
          </span>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-wide">The Brand Coach Network</p>
            <p className="text-[11px] text-muted-foreground dark:text-sidebar-foreground/70">Everyone is a Brand</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 rounded-xl px-3 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-muted hover:text-foreground dark:text-sidebar-foreground/85 dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-muted dark:text-sidebar-foreground/90 dark:hover:bg-sidebar-accent sm:inline-flex"
          >
            Log in
          </Link>
          <Link href="/register" className="btn btn-sm btn-primary">
            Sign Up
          </Link>
        </div>
      </div>

      <div className="border-t border-border/70 dark:border-sidebar-border/60 lg:hidden">
        <div className="container-app flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/85 dark:border-sidebar-border/80 dark:text-sidebar-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
