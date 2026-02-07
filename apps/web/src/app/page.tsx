import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ArrowRightIcon,
  PlayCircleIcon,
  UsersIcon,
  BookOpenIcon,
  StarIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'The Brand Coach Network | Build Your Brand, Transform Your Life',
  description:
    "Join Africa's premier coaching platform. Discover your brand, build visibility, and create measurable impact through structured coaching, community, and commerce.",
};

/**
 * Homepage — Marketing landing page
 * Hero + Features + How-it-works + Testimonials + CTA
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* ──────────────────── HERO ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />

          <div className="container-app relative py-24 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                #ABillionLivesGlobally
              </div>

              {/* Headline */}
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Build Your Brand.{' '}
                <span className="text-gradient">Transform Your Life.</span>
              </h1>

              {/* Sub-headline */}
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Join Africa&apos;s premier coaching platform. Discover your brand,
                build visibility, and create measurable impact through structured
                coaching, community, and commerce.
              </p>

              {/* CTA */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register" className="btn-primary btn-lg group">
                  Start Your Journey
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="btn-ghost btn-lg text-foreground hover:bg-muted">
                  <PlayCircleIcon className="h-6 w-6" />
                  Watch Demo
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  <span>5,000+ Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  <span>100+ Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span>4.9 Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────── VALUE PROPOSITION ──────────────────── */}
        <section className="section-padding bg-background">
          <div className="container-app">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need to Build Your Brand
              </h2>
              <p className="text-lg text-muted-foreground">
                A complete ecosystem designed to help African entrepreneurs
                discover, build, and scale their personal and business brands.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="card-hover p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── HOW IT WORKS ──────────────────── */}
        <section className="section-padding bg-muted/30">
          <div className="container-app">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Your Journey in 4 Steps
              </h2>
              <p className="text-lg text-muted-foreground">
                We&apos;ve designed a simple, proven path to help you go from idea to
                impact.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div key={step.title} className="relative text-center">
                  {idx < steps.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                  )}
                  <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-brand">
                    {idx + 1}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── TESTIMONIALS ──────────────────── */}
        <section className="section-padding bg-background">
          <div className="container-app">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Success Stories
              </h2>
              <p className="text-lg text-muted-foreground">
                Hear from entrepreneurs whose brands — and lives — have been
                transformed.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="card p-6">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mb-6 text-sm italic text-muted-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────── FINAL CTA ──────────────────── */}
        <section className="section-padding bg-primary">
          <div className="container-app text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to Transform Your Brand?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-primary-foreground/80">
              Join thousands of entrepreneurs who are building their brands and
              creating lasting impact with The Brand Coach Network.
            </p>
            <Link
              href="/register"
              className="btn btn-lg bg-background text-primary hover:bg-muted"
            >
              Get Started Free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: 'Structured Learning',
    description:
      'Access world-class courses designed by certified coaches. Learn at your own pace with interactive modules.',
    icon: BookOpenIcon,
  },
  {
    title: 'Expert Coaching',
    description:
      'Connect with certified coaches for personalised 1-on-1 sessions. Get guidance tailored to your journey.',
    icon: UsersIcon,
  },
  {
    title: 'Community Support',
    description:
      'Join a vibrant community of like-minded entrepreneurs. Share experiences, get feedback, and grow together.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Certifications',
    description:
      'Earn recognised certifications as you complete programs. Showcase your achievements to potential clients.',
    icon: AcademicCapIcon,
  },
  {
    title: 'Live Events & Masterclasses',
    description:
      'Attend exclusive online events, workshops, and masterclasses hosted by industry leaders.',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Progress Analytics',
    description:
      'Track your brand growth with detailed analytics and personalised insights to keep you on course.',
    icon: ChartBarIcon,
  },
];

const steps = [
  {
    title: 'Sign Up',
    description:
      'Create your free account and take the Brand Clarity Test to discover your unique brand identity.',
  },
  {
    title: 'Choose a Program',
    description:
      'Browse our curated catalog and enroll in programs that align with your brand goals.',
  },
  {
    title: 'Learn & Connect',
    description:
      'Complete lessons, join coaching sessions, and engage with the community.',
  },
  {
    title: 'Grow & Thrive',
    description:
      "Apply what you've learned, track your progress, and scale your brand with confidence.",
  },
];

const testimonials = [
  {
    name: 'Sarah Njeri',
    role: 'Entrepreneur, Nairobi',
    quote:
      'TBCN gave me the clarity and structure I needed to turn my passion into a recognisable brand. The coaching sessions were transformational.',
  },
  {
    name: 'James Okoth',
    role: 'Corporate Consultant, Lagos',
    quote:
      'Moving from corporate to consulting felt overwhelming until I found TBCN. The community support is incredible — I never felt alone in the journey.',
  },
  {
    name: 'Grace Achieng',
    role: 'CEC Coordinator, Kampala',
    quote:
      'Through the Community Empowerment Centre program, we trained over 200 women in our district. The impact has been life-changing.',
  },
];

