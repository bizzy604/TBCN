'use client';

import { Card } from '@/components/ui/Card';

export default function SecuritySettingsPage() {
  return (
    <Card className="p-6">
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your password, two-factor authentication, and connected accounts.
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your password to keep your account secure.
          </p>
          <div className="mt-4">
            <button
              disabled
              className="rounded-md bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground cursor-not-allowed"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Connected Accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your social login connections.
          </p>
          <div className="mt-4 space-y-3">
            {['Google', 'Facebook', 'LinkedIn'].map((provider) => (
              <div
                key={provider}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <span className="text-sm font-medium">{provider}</span>
                <span className="text-xs text-muted-foreground">Not connected</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}
