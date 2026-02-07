'use client';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your personal information and public profile.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <div className="h-10 w-full rounded-md border bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="h-10 w-full rounded-md border bg-muted/50" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <div className="h-24 w-full rounded-md border bg-muted/50" />
          </div>
          <p className="text-xs text-muted-foreground">
            Full profile editing will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
