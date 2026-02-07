'use client';

import { Card } from '@/components/ui/Card';

export default function MessagesPage() {
  return (
    <Card className="p-6">
      <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Communicate with your coaches and peers.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">💬</div>
          <h2 className="text-xl font-semibold">Messaging Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Direct messaging with coaches and group conversations will be available here.
          </p>
        </div>
      </div>
      </div>
    </Card>
  );
}
