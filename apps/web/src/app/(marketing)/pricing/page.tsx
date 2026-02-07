import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | Brand Coach Network',
  description: 'View pricing plans and subscription options for Brand Coach Network.',
};

export default function PricingPage() {
  return (
    <div className="space-y-16 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that fits your coaching journey.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        {/* Free Tier */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-2 text-sm text-muted-foreground">Get started with the basics</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2">✓ Browse programs</li>
            <li className="flex items-center gap-2">✓ Community access</li>
            <li className="flex items-center gap-2">✓ 1 free session</li>
          </ul>
        </div>

        {/* Pro Tier */}
        <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
            Most Popular
          </div>
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-2 text-sm text-muted-foreground">For serious learners</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">$49</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2">✓ All Free features</li>
            <li className="flex items-center gap-2">✓ Unlimited programs</li>
            <li className="flex items-center gap-2">✓ Priority coaching</li>
            <li className="flex items-center gap-2">✓ Progress tracking</li>
          </ul>
        </div>

        {/* Enterprise Tier */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-semibold">Enterprise</h3>
          <p className="mt-2 text-sm text-muted-foreground">For teams &amp; organizations</p>
          <div className="mt-6">
            <span className="text-4xl font-bold">Custom</span>
          </div>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2">✓ All Pro features</li>
            <li className="flex items-center gap-2">✓ Dedicated coach</li>
            <li className="flex items-center gap-2">✓ Custom programs</li>
            <li className="flex items-center gap-2">✓ Analytics dashboard</li>
          </ul>
        </div>
      </div>

      {/* Note */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
