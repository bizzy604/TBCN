'use client';

export default function SubscriptionSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription plan and billing details.
        </p>
      </div>

      {/* Current Plan */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current Plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">Free</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            Active
          </span>
        </div>
        <div className="mt-4">
          <button
            disabled
            className="rounded-md bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground cursor-not-allowed"
          >
            Upgrade Plan
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Plan upgrades and billing management coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
