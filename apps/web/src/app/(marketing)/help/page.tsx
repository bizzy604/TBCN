import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRightIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Help Centre',
  description:
    'Find support resources and quick answers for The Brand Coach Network platform.',
};

export default function HelpPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <LifebuoyIcon className="h-4 w-4" />
              Help Centre
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Need <span className="text-gradient">Support?</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Browse common answers below or contact the support team for direct
              help.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="card group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-foreground [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-primary btn-lg">
              Contact Support
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const faqs = [
  {
    question: 'How do I get started on TBCN?',
    answer:
      'Create an account, complete your profile, and start with the recommended first steps in Community, Collaboration, and Coaching.',
  },
  {
    question: 'Can I upgrade or downgrade my membership?',
    answer:
      'Yes. Membership tiers can be changed from your account settings, and new access levels apply according to your selected plan.',
  },
  {
    question: 'How do I book coaching sessions?',
    answer:
      'Go to the relevant coaching area, choose a coach or session type, and book using available slots.',
  },
  {
    question: 'Where can I get payment and billing support?',
    answer:
      'For payments, receipts, renewals, or invoicing support, contact us through the contact page and include your account email.',
  },
  {
    question: 'How do I report a community issue?',
    answer:
      'Use in-platform reporting options where available, then contact support with details so the moderation team can investigate quickly.',
  },
];
