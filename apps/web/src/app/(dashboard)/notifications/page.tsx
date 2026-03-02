'use client';

import { Card } from '@/components/ui/Card';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/hooks/use-engagement';

function dayBucket(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return 'Earlier';
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.data ?? [];
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = dayBucket(item.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Notifications Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Stay Updated</h1>
            <p className="mt-2 text-sm text-sidebar-foreground/80">Messages, course updates, event reminders, and payment alerts.</p>
          </div>
          <button type="button" onClick={() => markAll.mutate()} className="btn btn-sm border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="card h-24 animate-pulse bg-muted/55" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
        ) : (
          Object.entries(grouped).map(([bucket, entries]) => (
            <section key={bucket} className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{bucket}</h2>
              {entries.map((item) => (
                <article key={item.id} className={`card p-4 ${item.isRead ? '' : 'border-primary/35 bg-primary/6'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    {!item.isRead && (
                      <button type="button" onClick={() => markRead.mutate(item.id)} className="btn btn-sm btn-outline">
                        Mark read
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>
          ))
        )}
      </div>
    </Card>
  );
}
