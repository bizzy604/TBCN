import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Partner with The Brand Coach Network. Discover co-branded training, CSR programs, bulk enrollment, and enterprise solutions for corporates, NGOs, and institutions.',
};

/**
 * Partners page
 * Partnership value proposition, partner types, benefits, inquiry CTA
 */
export default function PartnersPage() {
  return (
    <>
      {/* ──────────────────── HERO ──────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <BuildingOffice2Icon className="h-4 w-4" />
              Strategic Partnerships
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              Partner with{' '}
              <span className="text-gradient">The Brand Coach Network</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join a growing ecosystem of corporates, institutions, and
              organisations that are investing in human capital development,
              brand-powered entrepreneurship, and measurable social impact
              across Africa and beyond.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="#inquiry" className="btn-primary btn-lg group">
                Become a Partner
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="btn-outline btn-lg">
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── PARTNER TYPES ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Partnership Opportunities
            </h2>
            <p className="text-lg text-muted-foreground">
              Whether you&apos;re a financial institution, corporate, NGO, or
              government body — we have a partnership model designed for your
              impact goals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {partnerTypes.map((pt) => (
              <div key={pt.title} className="card-hover p-8">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <pt.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{pt.title}</h3>
                <p className="mb-4 text-muted-foreground">{pt.description}</p>
                <ul className="flex flex-col gap-2">
                  {pt.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── WHY PARTNER ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Why Partner with TBCN?
            </h2>
            <p className="text-lg text-muted-foreground">
              We deliver measurable outcomes, not just engagement metrics.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── HOW IT WORKS ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A streamlined onboarding process from inquiry to impact.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => (
              <div key={step.title} className="relative text-center">
                {idx < processSteps.length - 1 && (
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

      {/* ──────────────────── COMMUNITY EMPOWERMENT CENTRES ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-app">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                  Grassroots Impact
                </p>
                <h2 className="mb-4 text-3xl font-bold">
                  Community Empowerment Centres (CECs)
                </h2>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  CECs are our grassroots hubs for local training and support —
                  physical community spaces where brand coaching meets real-world
                  impact. Partners can sponsor, host, or collaborate on CECs to
                  extend their reach into underserved communities.
                </p>
                <ul className="flex flex-col gap-3">
                  {cecFeatures.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg">
                  <GlobeAltIcon className="h-24 w-24 text-primary/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── PARTNERSHIP INQUIRY FORM ──────────────────── */}
      <section id="inquiry" className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Start a Conversation
              </h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Interested in partnering? Fill in the form and our partnerships
                team will be in touch within 48 hours.
              </p>
            </div>

            <form className="card p-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="orgName" className="label">
                    Organisation Name *
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    className="input"
                    placeholder="e.g. XYZ Bank"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactName" className="label">
                    Contact Person *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    className="input"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Work Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="input"
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="interest" className="label">
                    Partnership Interest *
                  </label>
                  <select id="interest" className="input" required>
                    <option value="">Select interest type</option>
                    <option value="training">Corporate Training</option>
                    <option value="csr">CSR / Social Impact</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="cec">
                      Community Empowerment Centres (CEC)
                    </option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="label">
                    Tell us more about your goals
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="input"
                    placeholder="Describe what you're looking to achieve..."
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-lg mt-8 w-full">
                Submit Partnership Inquiry
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const partnerTypes = [
  {
    title: 'Corporate Training Partner',
    description:
      'Upskill your employees and SME clients with structured brand and business development programs.',
    icon: AcademicCapIcon,
    features: [
      'Bulk enrollment via CSV (500+ users)',
      'Co-branded learning experiences',
      'Dedicated cohort and group management',
      'Aggregated performance analytics',
      'Quarterly impact review meetings',
    ],
  },
  {
    title: 'CSR & Social Impact Partner',
    description:
      'Demonstrate measurable CSR impact by investing in entrepreneurship and community empowerment.',
    icon: GlobeAltIcon,
    features: [
      'Sponsor Community Empowerment Centres',
      'Auto-generated impact reports',
      'Co-branded content and initiatives',
      'Scalable group training programs',
      'ROI justification documentation',
    ],
  },
  {
    title: 'Sponsorship Partner',
    description:
      'Align your brand with African entrepreneurship and gain visibility across our growing platform.',
    icon: SparklesIcon,
    features: [
      'Branded events and masterclasses',
      'Logo placement on platform and materials',
      'Speaking opportunities at TBCN events',
      'Access to community of 5,000+ entrepreneurs',
      'Featured partner profile on platform',
    ],
  },
  {
    title: 'CEC / Grassroots Partner',
    description:
      'Host or sponsor a Community Empowerment Centre to bring brand coaching to underserved communities.',
    icon: UserGroupIcon,
    features: [
      'Local training hub setup support',
      'Content and curriculum access',
      'Community coordinator training',
      'Impact measurement and reporting',
      'Networking with other CEC partners',
    ],
  },
];

const benefits = [
  {
    title: 'Measurable Outcomes',
    description:
      'Auto-generated impact reports with participant completion rates, skill growth, and ROI metrics.',
    icon: ChartBarSquareIcon,
  },
  {
    title: 'White-Label Solutions',
    description:
      'Co-branded or fully white-labelled program experiences with your organisation\'s identity.',
    icon: BuildingOffice2Icon,
  },
  {
    title: 'Scalable Enrollment',
    description:
      'Bulk enroll hundreds of participants at once via CSV upload with dedicated group management.',
    icon: UserGroupIcon,
  },
  {
    title: 'Expert Content',
    description:
      'Access to professionally designed courses from certified coaches and industry experts.',
    icon: AcademicCapIcon,
  },
  {
    title: 'Dedicated Support',
    description:
      'A dedicated partnership manager, quarterly review meetings, and priority support.',
    icon: DocumentTextIcon,
  },
  {
    title: 'Pan-African Reach',
    description:
      'Connect with entrepreneurs across Kenya, Nigeria, Uganda, and the African diaspora globally.',
    icon: GlobeAltIcon,
  },
];

const processSteps = [
  {
    title: 'Inquiry',
    description:
      'Submit the partnership form, and our team will review your goals within 48 hours.',
  },
  {
    title: 'Discovery Call',
    description:
      'We schedule a call to understand your needs and craft a customised partnership proposal.',
  },
  {
    title: 'Agreement',
    description:
      'Review and sign a digital partnership agreement with clearly defined deliverables.',
  },
  {
    title: 'Launch & Impact',
    description:
      'We set up your partner account, onboard participants, and begin measuring outcomes.',
  },
];

const cecFeatures = [
  'Physical or virtual community training hubs',
  'Curriculum and content provided by TBCN',
  'Goal: 50+ active CECs across Africa',
  'Group training for women, youth, and SMEs',
  'Monthly impact data and participant analytics',
];
