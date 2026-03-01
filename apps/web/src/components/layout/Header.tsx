import Link from 'next/link';
import { ChevronDownIcon, HomeIcon } from '@heroicons/react/24/outline';
import { SITE_ARCHITECTURE } from '@/lib/site-architecture';

/**
 * Marketing header with architecture-first navigation.
 */
export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container-app py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <HomeIcon className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-heading text-foreground">TBCN</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-2">
            {SITE_ARCHITECTURE.map((section) => (
              <div key={section.anchorId} className="group relative">
                <Link
                  href={`/#${section.anchorId}`}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {section.title}
                  <ChevronDownIcon className="h-4 w-4" />
                </Link>

                <div className="pointer-events-none absolute left-0 top-full z-30 w-80 translate-y-1 opacity-0 transition-all duration-200 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mt-2 rounded-xl border border-border bg-card p-4 shadow-lg">
                    <ul className="space-y-2">
                      {section.subPages.map((subPage) => (
                        <li key={subPage.anchorId}>
                          <Link
                            href={`/#${subPage.anchorId}`}
                            className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {subPage.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link href="/register" className="btn btn-sm btn-primary">
              Get Started
            </Link>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3 xl:hidden">
          <div className="grid gap-2 md:grid-cols-3">
            {SITE_ARCHITECTURE.map((section) => (
              <details
                key={section.anchorId}
                className="rounded-lg border border-border bg-card/60 px-3 py-2"
              >
                <summary className="list-none flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {section.title}
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </summary>
                <ul className="mt-2 space-y-1">
                  {section.subPages.map((subPage) => (
                    <li key={subPage.anchorId}>
                      <Link
                        href={`/#${subPage.anchorId}`}
                        className="block rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {subPage.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
