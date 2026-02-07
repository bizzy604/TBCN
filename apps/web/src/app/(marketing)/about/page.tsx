import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRightIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  SparklesIcon,
  UserGroupIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about The Brand Coach Network — a transformational digital ecosystem empowering individuals, entrepreneurs and communities globally through personal branding, learning, and collaborative empowerment.',
};

/**
 * About Us page
 * Mission, Vision, Values, Team, and Story
 */
export default function AboutPage() {
  return (
    <>
      {/* ──────────────────── HERO ──────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <HeartIcon className="h-4 w-4" />
              Our Story
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Empowering{' '}
              <span className="text-gradient">#ABillionLivesGlobally</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Brand Coach Network is a transformational digital ecosystem
              designed to empower individuals, entrepreneurs, and communities
              globally through structured personal branding, business
              development, learning, and collaborative empowerment.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────── MISSION & VISION ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Mission */}
            <div className="card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <RocketLaunchIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To serve as the technological backbone of the
                #ABillionLivesGlobally mission — providing a unified digital
                platform where everyone discovers their brand, builds their
                visibility, and creates sustainable impact — supported by
                world-class coaching, peer collaboration, and measurable
                outcomes.
              </p>
            </div>

            {/* Vision */}
            <div className="card p-8">
              <div className="mb-4 inline-flex rounded-lg bg-secondary/10 p-3">
                <GlobeAltIcon className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A world where every individual recognises that they are a brand —
                where surviving individuals are transformed into thriving brands
                that create positive economic and social impact across Africa and
                beyond. &ldquo;Everyone is a Brand&trade;&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── CORE VALUES ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              What We Stand For
            </h2>
            <p className="text-lg text-muted-foreground">
              Our values guide every decision, from feature development to
              community management.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card-hover p-6 text-center">
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── FOUNDER SPOTLIGHT ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-5">
              {/* Photo placeholder */}
              <div className="lg:col-span-2">
                <div className="mx-auto flex aspect-square w-64 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg lg:w-full">
                  <span className="text-6xl font-bold text-primary">WE</span>
                </div>
              </div>

              {/* Bio */}
              <div className="lg:col-span-3">
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                  Meet the Founder
                </p>
                <h2 className="mb-4 text-3xl font-bold">
                  Winston Eboyi — The Brand Coach&trade;
                </h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  Winston Eboyi is a certified personal brand coach, speaker, and
                  serial entrepreneur passionate about transforming lives across
                  Africa and beyond. With decades of experience in brand strategy,
                  leadership development, and community empowerment, Winston
                  founded The Brand Coach Network to create a movement — not just
                  a platform.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  His vision of &ldquo;From Surviving Individuals to Thriving
                  Brands&trade;&rdquo; has already impacted thousands of
                  entrepreneurs through coaching programs, masterclasses, and
                  Community Empowerment Centres across the continent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── IMPACT NUMBERS ──────────────────── */}
      <section className="section-padding bg-primary">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Our Impact So Far
            </h2>
            <p className="text-lg text-primary-foreground/80">
              And we&apos;re just getting started.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-primary-foreground">
                  {s.value}
                </p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── FLAGSHIP PROGRAMS ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Flagship Programs
            </h2>
            <p className="text-lg text-muted-foreground">
              Structured journeys designed to take you from discovery to impact.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <div key={p.title} className="card-hover p-6">
                <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {p.tag}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── CTA ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-app text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Join the Movement
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Whether you&apos;re an aspiring entrepreneur, a seasoned
            professional, or a corporate partner — there&apos;s a place for you
            at The Brand Coach Network.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" className="btn-primary btn-lg group">
              Get Started Free
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/partners" className="btn-outline btn-lg">
              Become a Partner
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const values = [
  {
    title: 'User Transformation',
    description:
      'Every feature should clearly contribute to brand growth outcomes. Transformation over feature count.',
    icon: SparklesIcon,
  },
  {
    title: 'Mission Integrity',
    description:
      'We never compromise on quality to maximise conversions. Every decision aligns with #ABillionLivesGlobally.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'African Authenticity',
    description:
      'We celebrate and stay true to the African entrepreneurial spirit and grassroots empowerment.',
    icon: GlobeAltIcon,
  },
  {
    title: 'Human Relationships',
    description:
      'Technology should enhance human relationships, not replace them. Mentorship and community are core.',
    icon: UserGroupIcon,
  },
  {
    title: 'Content is King',
    description:
      'Community is Kingdom. We invest deeply in world-class content backed by a supportive peer network.',
    icon: AcademicCapIcon,
  },
  {
    title: 'Measurable Impact',
    description:
      'We believe in outcomes you can see and measure — success stories backed by data, not just promises.',
    icon: LightBulbIcon,
  },
];

const stats = [
  { value: '5,000+', label: 'Community Members' },
  { value: '100+', label: 'Courses & Programs' },
  { value: '50+', label: 'Certified Coaches' },
  { value: '10+', label: 'Community Empowerment Centres' },
];

const programs = [
  {
    title: 'Master Your Brand Program (MBP)',
    tag: 'Flagship',
    description:
      'Our signature personal branding bootcamp — a structured journey from brand discovery to brand mastery, complete with coaching, peer accountability, and certification.',
  },
  {
    title: 'Business Acceleration & Growth (BAG)',
    tag: 'Incubation',
    description:
      'An intensive business incubation program designed to help entrepreneurs scale their ventures with strategy, mentorship, and actionable frameworks.',
  },
  {
    title: 'Brand Clarity Test',
    tag: 'Self-Discovery',
    description:
      'A diagnostic tool that helps you uncover your unique brand identity, strengths, and positioning — your first step on the brand journey.',
  },
];
