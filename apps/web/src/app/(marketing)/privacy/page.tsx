import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for The Brand Coach Network web platform.',
};

export default function PrivacyPage() {
  return (
    <section className="section-padding bg-background">
      <div className="container-app">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Last updated: March 1, 2026
          </p>

          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                1. Data We Collect
              </h2>
              <p>
                We collect account, profile, learning, and engagement data to
                provide platform features and improve user experience.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                2. How We Use Data
              </h2>
              <p>
                Data is used for account access, learning progress, coaching,
                communication, billing, support, and platform analytics.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                3. Data Sharing
              </h2>
              <p>
                We do not sell personal data. Limited sharing may occur with
                service providers required for platform operations.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                4. Security
              </h2>
              <p>
                We apply appropriate security controls, including encrypted data
                handling and role-based access processes.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                5. Contact
              </h2>
              <p>
                For privacy questions, contact
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
