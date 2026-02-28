'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useConversations, useMessageThread, useSendMessage } from '@/hooks/use-engagement';

export default function MessagesPage() {
  const conversationsQuery = useConversations();
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const conversations = conversationsQuery.data ?? [];
  const currentPeerId = activePeerId || conversations[0]?.peerId || '';

  const threadQuery = useMessageThread(currentPeerId);
  const sendMessage = useSendMessage();

  const thread = useMemo(() => threadQuery.data?.data ?? [], [threadQuery.data]);

  const handleSend = async () => {
    if (!currentPeerId || !draft.trim()) return;
    setMessage(null);
    try {
      await sendMessage.mutateAsync({ recipientId: currentPeerId, content: draft.trim() });
      setDraft('');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to send message');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="mt-2 text-muted-foreground">Send and manage direct conversations.</p>
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <div className="grid gap-4 md:grid-cols-[280px,1fr]">
          <aside className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-3 text-sm font-semibold">Conversations</h2>
            {conversationsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.peerId}
                    type="button"
                    onClick={() => setActivePeerId(conv.peerId)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      currentPeerId === conv.peerId ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <p className="font-medium">{conv.peer.firstName} {conv.peer.lastName}</p>
                    <p className="truncate text-xs text-muted-foreground">{conv.lastMessage.content}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="rounded-lg border border-border bg-card p-4">
            {!currentPeerId ? (
              <p className="text-sm text-muted-foreground">Select a conversation to view messages.</p>
            ) : (
              <>
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {threadQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  ) : thread.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  ) : (
                    thread.map((msg) => (
                      <div key={msg.id} className="rounded-md border border-border bg-muted/20 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {msg.sender?.firstName} {msg.sender?.lastName} • {new Date(msg.createdAt).toLocaleString()}
                        </p>
                        <p className="mt-1">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Type a message"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sendMessage.isPending}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </Card>
  );
}

