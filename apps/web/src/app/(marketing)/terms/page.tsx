import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for use of The Brand Coach Network platform.',
};

export default function TermsPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-app">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: March 1, 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                1. Use of Platform
              </h2>
              <p>
                By using this platform, you agree to comply with applicable
                laws and community standards.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                2. Accounts and Access
              </h2>
              <p>
                You are responsible for your account credentials and all
                activities under your account.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                3. Payments and Subscriptions
              </h2>
              <p>
                Paid services are billed according to selected plans and
                applicable renewal terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                4. Content and Conduct
              </h2>
              <p>
                Users must not post abusive, harmful, or unlawful content.
                Violations may result in moderation action or account
                suspension.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                5. Contact
              </h2>
              <p>
                For terms-related questions, contact
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
