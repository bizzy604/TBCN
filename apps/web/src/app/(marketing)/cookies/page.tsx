import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie usage policy for The Brand Coach Network platform.',
};

export default function CookiesPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-app">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: March 1, 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                1. What Cookies Are
              </h2>
              <p>
                Cookies are small data files stored on your device to support
                platform functionality and improve experience.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                2. How We Use Cookies
              </h2>
              <p>
                We use cookies for authentication, preferences, performance,
                and analytics across the platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                3. Managing Cookies
              </h2>
              <p>
                You can control cookies from your browser settings. Disabling
                some cookies may affect platform behavior.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                4. Contact
              </h2>
              <p>
                For questions about cookie usage, contact
                {' '}
                <a
                  href="mailto:hello@brandcoachnetwork.com"
                  className="text-primary hover:underline"
                >
                  hello@brandcoachnetwork.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
