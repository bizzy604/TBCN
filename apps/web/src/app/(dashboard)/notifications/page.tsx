'use client';

import { Card } from '@/components/ui/Card';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-engagement';

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.data ?? [];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-2 text-muted-foreground">Track account and platform updates in one place.</p>
          </div>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            Mark all as read
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-lg border p-4 ${item.isRead ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(item.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

