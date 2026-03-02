import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'The Brand Coach Network | Everyone is a Brand',
  description:
    'Personal branding and entrepreneurship coaching for African professionals. Learn, build, and scale with a practical member ecosystem.',
};

const valueCards = [
  {
    title: 'Structured Learning Paths',
    body: 'Progressive programs for personal branding, business growth, and leadership with clear weekly outcomes.',
    icon: BookOpenIcon,
  },
  {
    title: 'Coaching That Converts',
    body: 'Book practical sessions with vetted coaches and leave each session with a concrete execution plan.',
    icon: UserGroupIcon,
  },
  {
    title: 'Community + Accountability',
    body: 'Stay visible and consistent through peer groups, events, and feedback loops designed for momentum.',
    icon: CalendarDaysIcon,
  },
];

const featuredPrograms = [
  {
    title: 'Personal Brand Foundation',
    coach: 'Winston Eboyi',
    price: 'KES 9,500',
    tier: 'Build',
    description: 'Clarify your positioning, message, and market presence in 6 weeks.',
  },
  {
    title: 'Authority Content System',
    coach: 'Sarah Njeri',
    price: 'KES 12,000',
    tier: 'Thrive',
    description: 'Build a repeatable content engine that attracts aligned opportunities.',
  },
  {
    title: 'Enterprise Influence Lab',
    coach: 'James Okoth',
    price: 'KES 18,500',
    tier: 'Impact',
    description: 'Advanced executive communication and thought leadership for scale.',
  },
];

const steps = [
  'Create your profile and define your goals.',
  'Choose a program, coach, or event aligned to your stage.',
  'Execute weekly actions, track progress, and showcase outcomes.',
];

const testimonials = [
  {
    quote: 'I moved from uncertainty to a clear brand strategy in one month. The structure is excellent.',
    name: 'Grace Achieng',
    role: 'SME Founder, Kampala',
  },
  {
    quote: 'The coaching sessions are practical and direct. Every session ends with actions I can execute immediately.',
    name: 'Paul Mwangi',
    role: 'Consultant, Nairobi',
  },
  {
    quote: 'Our team used the platform to sharpen leadership messaging and improve client confidence.',
    name: 'Linda Okoye',
    role: 'Partner Lead, Lagos',
  },
];

const plans = [
  {
    name: 'Discover',
    price: 'Free',
    details: ['Community access', 'Selected intro lessons', 'Events preview'],
  },
  {
    name: 'Build',
    price: 'KES 4,500/mo',
    details: ['Program access', 'Progress tracking', 'Resource downloads'],
    featured: true,
  },
  {
    name: 'Thrive',
    price: 'KES 8,500/mo',
    details: ['Everything in Build', 'Coach booking priority', 'Advanced analytics'],
  },
  {
    name: 'Impact',
    price: 'Custom',
    details: ['Team onboarding', 'Partner reporting', 'Dedicated support'],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-border bg-background">
          <div className="absolute inset-0 subtle-grid opacity-40" aria-hidden="true" />
          <div className="container-app relative py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6 animate-reveal-up">
                <p className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  <SparklesIcon className="h-4 w-4" />
                  Personal Branding + Entrepreneurship
                </p>
                <h1 className="max-w-xl text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                  Everyone is a <span className="text-gradient">Brand</span>
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Build a visible personal brand, strengthen business leadership, and create measurable impact with practical coaching and community-led execution.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-lg btn-primary">
                    Get Started
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link href="/programs" className="btn btn-lg btn-secondary">
                    View Programs
                  </Link>
                </div>
              </div>

              <div className="animate-reveal-up">
                <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="absolute -left-4 -top-4 h-20 w-20 rounded-2xl bg-accent/25 blur-xl" aria-hidden="true" />
                  <div className="space-y-5">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">This Week</p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">8,240 learning hours</p>
                      <p className="text-sm text-muted-foreground">Across members, coaches, and cohorts</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Programs</p>
                        <p className="mt-1 text-xl font-semibold">120+</p>
                      </div>
                      <div className="rounded-xl border border-border bg-background p-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Certified Coaches</p>
                        <p className="mt-1 text-xl font-semibold">70+</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-primary/25 bg-primary/8 p-4">
                      <p className="text-sm text-foreground">Join professionals from Nairobi, Lagos, Kampala, Kigali, and beyond.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-app">
            <div className="grid gap-4 md:grid-cols-3">
              {valueCards.map((item) => (
                <article key={item.title} className="card-hover p-6">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/16 text-secondary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-programs" className="section-padding pt-0">
          <div className="container-app space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Featured Programs</p>
                <h2 className="mt-2">Build Skills That Scale</h2>
              </div>
              <Link href="/programs" className="btn btn-outline">
                Explore Catalog
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredPrograms.map((program) => (
                <article key={program.title} className="card-hover p-5">
                  <div className="mb-4 aspect-[16/9] rounded-xl bg-gradient-to-br from-secondary/30 to-accent/35" />
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="badge-brand">{program.tier}</span>
                    <span className="text-sm font-semibold text-foreground">{program.price}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{program.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Coach: {program.coach}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{program.description}</p>
                  <Link href="/programs" className="btn btn-primary mt-4 w-full">
                    Enroll
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section-padding bg-card/65">
          <div className="container-app">
            <h2 className="mb-8 text-center">How It Works</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step} className="card p-5 text-center">
                  <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-app space-y-8">
            <div className="text-center">
              <h2>Testimonials</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => (
                <article key={item.name} className="card p-5">
                  <div className="mb-3 flex items-center gap-1 text-accent">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon key={`${item.name}-${idx}`} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">"{item.quote}"</p>
                  <p className="mt-4 text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-padding bg-card/65">
          <div className="container-app">
            <h2 className="mb-8 text-center">Pricing Tiers</h2>
            <div className="grid gap-4 lg:grid-cols-4">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`card p-5 ${plan.featured ? 'border-primary ring-1 ring-primary/35' : ''}`}
                >
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{plan.price}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {plan.details.map((detail) => (
                      <li key={`${plan.name}-${detail}`}>- {detail}</li>
                    ))}
                  </ul>
                  <Link href="/register" className={`btn mt-5 w-full ${plan.featured ? 'btn-primary' : 'btn-outline'}`}>
                    Choose {plan.name}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding pt-10">
          <div className="container-app">
            <div className="rounded-2xl border border-border bg-sidebar px-6 py-8 text-sidebar-foreground md:px-10">
              <p className="text-xs uppercase tracking-[0.18em] text-sidebar-foreground/70">Trusted by Teams and Partners</p>
              <div className="mt-5 grid gap-3 text-center text-sm font-semibold sm:grid-cols-2 lg:grid-cols-5">
                <span className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-4 py-3">Impact Hub</span>
                <span className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-4 py-3">SME Growth Forum</span>
                <span className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-4 py-3">Women in Tech Africa</span>
                <span className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-4 py-3">Leadership Circle</span>
                <span className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-4 py-3">Youth Enterprise Lab</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding pt-0">
          <div className="container-app">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center md:p-10">
              <h2 className="text-3xl font-semibold">Ready to Build Your Brand?</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Start with Discover or jump into Build to accelerate your transformation with structured coaching, community, and execution support.
              </p>
              <Link href="/register" className="btn btn-primary mt-6">
                Create Your Account
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
