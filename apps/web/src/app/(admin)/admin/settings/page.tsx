'use client';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure default admin preferences for operations and alerts.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Platform Notifications</h2>
          <p className="text-sm text-muted-foreground">Receive alerts when high-priority moderation and payment events occur.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked />
          Email alerts for failed payments
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked />
          Email alerts for locked community posts
        </label>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Admin Session</h2>
          <p className="text-sm text-muted-foreground">Basic session defaults for admin users.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked />
          Require re-authentication for sensitive actions
        </label>
      </section>
    </div>
  );
}
