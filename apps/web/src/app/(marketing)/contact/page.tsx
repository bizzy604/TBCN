import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  BuildingOffice2Icon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with The Brand Coach Network. Reach out for general inquiries, support, partnerships, or press.',
};

/**
 * Contact page
 * Contact form, channel cards, office info, FAQ teaser
 */
export default function ContactPage() {
  return (
    <>
      {/* ──────────────────── HERO ──────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        <div className="container-app relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Get in Touch
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              We&apos;d Love to{' '}
              <span className="text-gradient">Hear from You</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you have a question about our programs, need technical
              support, or want to explore a partnership — our team is here to
              help.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────── CONTACT CHANNELS ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((ch) => (
              <div key={ch.title} className="card-hover p-6 text-center">
                <div className="mx-auto mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <ch.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">{ch.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {ch.description}
                </p>
                {ch.href ? (
                  <a
                    href={ch.href}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {ch.action}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-primary">
                    {ch.action}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── FORM + SIDEBAR ──────────────────── */}
      <section className="section-padding bg-muted/30">
        <div className="container-app">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <h2 className="mb-2 text-2xl font-bold">Send Us a Message</h2>
              <p className="mb-8 text-muted-foreground">
                Fill in the form below and we&apos;ll get back to you within 24
                hours.
              </p>

              <form className="card p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="label">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="input"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="input"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      placeholder="you@example.com"
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
                    <label htmlFor="subject" className="label">
                      Subject *
                    </label>
                    <select id="subject" className="input" required>
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="programs">Programs &amp; Courses</option>
                      <option value="coaching">Coaching Sessions</option>
                      <option value="partnerships">Partnerships</option>
                      <option value="billing">Billing &amp; Payments</option>
                      <option value="press">Press &amp; Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="label">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="input"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary btn-lg mt-8 w-full"
                >
                  Send Message
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-2">
              {/* Office Details */}
              <div className="card p-8">
                <h3 className="mb-6 text-xl font-semibold">Our Office</h3>
                <div className="flex flex-col gap-5">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <a
                        href="mailto:hello@brandcoachnetwork.com"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        hello@brandcoachnetwork.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <a
                        href="tel:+254700000000"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        +254 700 000 000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday – Friday, 8:00 AM – 6:00 PM (EAT)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="card mt-6 p-8">
                <h3 className="mb-4 text-xl font-semibold">Quick Links</h3>
                <ul className="flex flex-col gap-3">
                  <li>
                    <Link
                      href="/help"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <QuestionMarkCircleIcon className="h-4 w-4" />
                      Help Centre &amp; FAQs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/partners"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <BuildingOffice2Icon className="h-4 w-4" />
                      Partnership Inquiries
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      <NewspaperIcon className="h-4 w-4" />
                      About The Brand Coach Network
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Map Placeholder */}
              <div className="mt-6 overflow-hidden rounded-xl border border-border">
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <div className="text-center">
                    <MapPinIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── FAQ TEASER ──────────────────── */}
      <section className="section-padding bg-background">
        <div className="container-app">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mb-10 text-lg text-muted-foreground">
                Quick answers to the most common questions we get.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="card group cursor-pointer p-6"
                >
                  <summary className="flex items-center justify-between font-medium text-foreground">
                    {faq.question}
                    <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
const channels = [
  {
    title: 'Email Us',
    description: 'For general inquiries and support.',
    icon: EnvelopeIcon,
    href: 'mailto:hello@brandcoachnetwork.com',
    action: 'hello@brandcoachnetwork.com',
  },
  {
    title: 'Call Us',
    description: 'Mon–Fri, 8 AM – 6 PM (EAT).',
    icon: PhoneIcon,
    href: 'tel:+254700000000',
    action: '+254 700 000 000',
  },
  {
    title: 'Live Chat',
    description: 'Chat with a team member in real time.',
    icon: ChatBubbleLeftRightIcon,
    href: undefined,
    action: 'Coming Soon',
  },
  {
    title: 'Partnerships',
    description: 'Explore corporate & institutional partnerships.',
    icon: BuildingOffice2Icon,
    href: '/partners#inquiry',
    action: 'Partner with us →',
  },
];

const faqs = [
  {
    question: 'Is there a free plan?',
    answer:
      'Yes! Our Discover tier is completely free and includes introductory content, a basic profile, and access to the community newsletter.',
  },
  {
    question: 'How do I book a coaching session?',
    answer:
      'Once you\'re a member, visit the Coaches directory, find a coach that matches your needs, and book an available slot directly on their profile page.',
  },
  {
    question: 'Can my organisation enroll employees in bulk?',
    answer:
      'Absolutely. Our partnership plans support bulk CSV enrollment for 500+ participants with dedicated cohort management. Visit our Partners page for details.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept Visa, Mastercard, mobile money (M-PESA), and bank transfers. Enterprise partners can also pay via invoice.',
  },
  {
    question: 'How do I become a certified coach on the platform?',
    answer:
      'Certified coaches can apply through our Coach onboarding flow. After profile verification and credential review, approved coaches gain access to the coaching marketplace.',
  },
];
