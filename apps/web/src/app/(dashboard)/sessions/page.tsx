'use client';

export default function SessionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
        <p className="mt-2 text-muted-foreground">
          View your upcoming and past coaching sessions.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">📹</div>
          <h2 className="text-xl font-semibold">Sessions Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Schedule and manage your one-on-one and group coaching sessions here.
          </p>
        </div>
      </div>
    </div>
  );
}
