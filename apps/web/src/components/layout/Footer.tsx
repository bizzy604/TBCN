import Link from "next/link";
import SocialLinksBar from "@/components/shared/SocialLinksBar";

const columns = {
  platform: [
    { label: "Programs", href: "/#featured-programs" },
    { label: "Coach Directory", href: "/#coach-directory" },
    { label: "Events", href: "/events" },
    { label: "Community", href: "/community" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Partners", href: "/partners" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  policy: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Help", href: "/help" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="container-app py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-lg font-semibold">The Brand Coach Network</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-sidebar-foreground/75">
              A practical ecosystem for personal branding, entrepreneurship
              coaching, and measurable impact for individuals, coaches, and
              partner organizations.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              #ABillionLivesGlobally
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/75">
              Platform
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {columns.platform.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sidebar-foreground/85 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/75">
              Company
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {columns.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sidebar-foreground/85 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/75">
              Legal
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {columns.policy.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sidebar-foreground/85 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <div className="border-t border-sidebar-border pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
                Be our social media guest
              </p>
              <SocialLinksBar
                className="mt-6"
                linkClassName="border border-sidebar-border bg-sidebar-accent/20 text-sidebar-foreground/75 hover:border-primary/40 hover:bg-sidebar-accent/40 hover:text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright {new Date().getFullYear()} The Brand Coach Network. All
            rights reserved.
          </p>
          <p>&quot;Everyone is a Brand&quot;</p>
        </div>
      </div>
    </footer>
  );
}
