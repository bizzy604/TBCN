import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRightIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Build meaningful work with The Brand Coach Network and contribute to #ABillionLivesGlobally.',
};

export default function CareersPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <BriefcaseIcon className="h-4 w-4" />
              Careers
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Join the <span className="text-gradient">TBCN Mission</span>
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              We are building a mission-driven ecosystem for coaching,
              collaboration, and community impact across Africa and beyond.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {roles.map((role) => (
              <article key={role.title} className="card-hover p-6">
                <h2 className="mb-2 text-xl font-semibold">{role.title}</h2>
                <p className="text-sm text-muted-foreground">{role.summary}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-primary btn-lg">
              Apply via Contact
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const roles = [
  {
    title: 'Community Programs Coordinator',
    summary:
      'Support community initiatives, cohort engagement, and impact reporting across CEC and partner programs.',
  },
  {
    title: 'Learning Experience Specialist',
    summary:
      'Design and improve practical learning pathways, assessment flows, and program completion experiences.',
  },
  {
    title: 'Partnership Success Associate',
    summary:
      'Enable institutional partners through onboarding, reporting, and long-term partnership outcomes.',
  },
  {
    title: 'Product & Engineering Contributor',
    summary:
      'Help evolve platform capabilities across coaching, collaboration, and commerce with quality-first execution.',
  },
];
