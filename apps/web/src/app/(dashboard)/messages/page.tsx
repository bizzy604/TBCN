'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store';
import type { ConversationSummary, DirectMessage } from '@/lib/api/messages';
import { usersApi, type DirectoryUser } from '@/lib/api/users';

function resolveSocketBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  if (apiUrl.endsWith('/api/v1')) {
    return apiUrl.slice(0, -7);
  }
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  return apiUrl;
}

async function emitWithAck<T>(socket: Socket, event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (response: T & { message?: string; statusCode?: number }) => {
      if (response && typeof response === 'object' && response.statusCode) {
        reject(new Error(response.message || 'Socket request failed'));
        return;
      }
      resolve(response);
    });
  });
}

export default function MessagesPage() {
  const { accessToken, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [directorySearch, setDirectorySearch] = useState('');
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [thread, setThread] = useState<DirectMessage[]>([]);

  const currentPeerId = activePeerId || conversations[0]?.peerId || '';
  const baseUrl = useMemo(() => resolveSocketBaseUrl(), []);

  const { data: directoryData, isLoading: isLoadingDirectory } = useQuery({
    queryKey: ['messages', 'directory', directorySearch],
    queryFn: () =>
      usersApi.listDirectory({
        search: directorySearch.trim() || undefined,
        page: 1,
        limit: 12,
      }),
    enabled: !!accessToken,
  });

  const directoryUsers = directoryData?.data ?? [];

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = io(`${baseUrl}/messages`, {
      transports: ['websocket'],
      auth: { token: accessToken },
      extraHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    socketRef.current = socket;

    socket.on('connect_error', (error) => {
      setMessage(error.message || 'Messaging socket connection failed');
    });

    socket.on('message.new', (incoming: DirectMessage) => {
      const peerId = incoming.senderId === user?.id ? incoming.recipientId : incoming.senderId;
      const isIncoming = incoming.recipientId === user?.id;
      const isActiveThread = currentPeerId === peerId;

      setConversations((prev) => {
        const existing = prev.find((item) => item.peerId === peerId);
        const peer = incoming.senderId === user?.id ? incoming.recipient : incoming.sender;
        if (!peer) {
          return prev;
        }

        const nextItem: ConversationSummary = {
          peerId,
          peer,
          lastMessage: incoming,
          unreadCount:
            isIncoming && !isActiveThread
              ? (existing?.unreadCount ?? 0) + 1
              : (existing?.unreadCount ?? 0),
        };

        const withoutCurrent = prev.filter((item) => item.peerId !== peerId);
        return [nextItem, ...withoutCurrent];
      });

      if (currentPeerId && (incoming.senderId === currentPeerId || incoming.recipientId === currentPeerId)) {
        setThread((prev) => [...prev, incoming]);
      }

      if (isIncoming && isActiveThread) {
        emitWithAck(socket, 'message.read', { messageId: incoming.id }).catch(() => undefined);
      }
    });

    socket.on('message.read', ({ messageId, readAt }: { messageId: string; readAt: string }) => {
      setThread((prev) => prev.map((item) => (item.id === messageId ? { ...item, readAt } : item)));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, baseUrl, currentPeerId, user?.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !accessToken) {
      return;
    }

    const loadConversations = async () => {
      setIsLoadingConversations(true);
      setMessage(null);
      try {
        const response = await emitWithAck<ConversationSummary[]>(socket, 'conversation.list');
        setConversations(response ?? []);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load conversations');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [accessToken]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentPeerId) {
      setThread([]);
      return;
    }

    const loadThread = async () => {
      setIsLoadingThread(true);
      setMessage(null);
      try {
        const response = await emitWithAck<{ items: DirectMessage[] }>(socket, 'conversation.get', {
          peerId: currentPeerId,
          page: 1,
          limit: 100,
        });
        const items = response?.items ?? [];
        setThread(items);

        const unreadIncoming = items.filter(
          (item) => item.recipientId === user?.id && !item.readAt,
        );
        if (unreadIncoming.length > 0) {
          await Promise.all(
            unreadIncoming.map((item) =>
              emitWithAck(socket, 'message.read', { messageId: item.id }).catch(() => undefined),
            ),
          );
          setConversations((prev) =>
            prev.map((conv) =>
              conv.peerId === currentPeerId
                ? { ...conv, unreadCount: 0 }
                : conv,
            ),
          );
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load thread');
      } finally {
        setIsLoadingThread(false);
      }
    };

    loadThread();
  }, [currentPeerId, user?.id]);

  const handleSend = async () => {
    const socket = socketRef.current;
    if (!socket || !currentPeerId || !draft.trim()) {
      return;
    }

    setMessage(null);
    setIsSending(true);
    try {
      await emitWithAck<DirectMessage>(socket, 'message.send', {
        recipientId: currentPeerId,
        content: draft.trim(),
      });
      setDraft('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartChat = (entry: DirectoryUser) => {
    const peer = {
      id: entry.id,
      firstName: entry.firstName,
      lastName: entry.lastName,
      avatarUrl: entry.avatarUrl,
    };

    setActivePeerId(entry.id);
    setConversations((prev) => {
      const existing = prev.find((conv) => conv.peerId === entry.id);
      if (existing) {
        return prev;
      }

      const placeholderMessage: DirectMessage = {
        id: `draft-${entry.id}`,
        senderId: user?.id || '',
        recipientId: entry.id,
        content: '',
        readAt: null,
        sender: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              avatarUrl: user.avatarUrl,
            }
          : undefined,
        recipient: peer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return [
        {
          peerId: entry.id,
          peer,
          lastMessage: placeholderMessage,
          unreadCount: 0,
        },
        ...prev,
      ];
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="mt-2 text-muted-foreground">Send and manage direct conversations via realtime sockets.</p>
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <div className="grid gap-4 md:grid-cols-[280px,1fr]">
          <aside className="rounded-lg border border-border bg-card p-3">
            <h2 className="mb-3 text-sm font-semibold">Conversations</h2>
            <div className="mb-3 space-y-2">
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Search users to start chat"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
              />
              {isLoadingDirectory ? (
                <p className="text-xs text-muted-foreground">Loading users...</p>
              ) : directoryUsers.length > 0 ? (
                <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                  {directoryUsers.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleStartChat(entry)}
                      className="w-full rounded-md border border-border px-2 py-1.5 text-left text-xs hover:bg-muted"
                    >
                      <p className="font-medium">
                        {entry.firstName} {entry.lastName}
                      </p>
                      <p className="text-muted-foreground">{entry.role.replace('_', ' ')}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No users found.</p>
              )}
            </div>
            {isLoadingConversations ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.peerId}
                    type="button"
                    onClick={() => {
                      setActivePeerId(conv.peerId);
                      setConversations((prev) =>
                        prev.map((item) =>
                          item.peerId === conv.peerId ? { ...item, unreadCount: 0 } : item,
                        ),
                      );
                    }}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                      currentPeerId === conv.peerId ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{conv.peer.firstName} {conv.peer.lastName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conv.lastMessage.content || 'No messages yet. Start conversation.'}
                    </p>
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
                  {isLoadingThread ? (
                    <p className="text-sm text-muted-foreground">Loading messages...</p>
                  ) : thread.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  ) : (
                    thread.map((msg) => (
                      <div key={msg.id} className="rounded-md border border-border bg-muted/20 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {msg.sender?.firstName} {msg.sender?.lastName} - {new Date(msg.createdAt).toLocaleString()}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    {isSending ? 'Sending...' : 'Send'}
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
