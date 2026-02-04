import Link from 'next/link';
import { ArrowRightIcon, PlayCircleIcon, UsersIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/outline';

/**
 * Homepage - Marketing landing page
 * Showcases the platform's value proposition
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5" />
        
        <div className="container-app relative py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-2 text-sm text-brand-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              #ABillionLivesGlobally
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Build Your Brand.{' '}
              <span className="text-gradient">Transform Your Life.</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-300 sm:text-xl">
              Join Africa's premier coaching platform. Discover your brand, build visibility, 
              and create measurable impact through structured coaching, community, and commerce.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="btn-primary btn-lg group">
                Start Your Journey
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="btn-ghost btn-lg text-white hover:bg-white/10">
                <PlayCircleIcon className="h-6 w-6" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-neutral-400">
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

      {/* Features Section */}
      <section className="section-padding bg-neutral-50 dark:bg-neutral-950">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Build Your Brand
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              A complete ecosystem designed to help African entrepreneurs discover, 
              build, and scale their personal and business brands.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card-hover p-6">
                <div className="mb-4 inline-flex rounded-lg bg-brand-100 p-3 dark:bg-brand-900/30">
                  <feature.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-brand-500">
        <div className="container-app text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Brand?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-brand-100">
            Join thousands of entrepreneurs who are building their brands and 
            creating lasting impact with The Brand Coach Network.
          </p>
          <Link href="/register" className="btn btn-lg bg-white text-brand-600 hover:bg-neutral-100">
            Get Started Free
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

// Feature data
const features = [
  {
    title: 'Structured Learning',
    description: 'Access world-class courses designed by certified coaches. Learn at your own pace with interactive modules.',
    icon: BookOpenIcon,
  },
  {
    title: 'Expert Coaching',
    description: 'Connect with certified coaches for personalized 1-on-1 sessions. Get guidance tailored to your journey.',
    icon: UsersIcon,
  },
  {
    title: 'Community Support',
    description: 'Join a vibrant community of like-minded entrepreneurs. Share experiences, get feedback, and grow together.',
    icon: StarIcon,
  },
];
