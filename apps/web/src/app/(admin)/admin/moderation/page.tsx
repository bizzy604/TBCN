'use client';

import { useEffect, useState } from 'react';
import { communityApi, type CommunityPost } from '@/lib/api/community';

export default function AdminModerationPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await communityApi.moderationListPosts(50);
      setPosts(data);
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to load moderation feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleLock = async (post: CommunityPost) => {
    setMessage(null);
    try {
      await communityApi.moderationSetLock(post.id, !post.isLocked);
      await load();
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to update post lock state');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderation</h1>
        <p className="text-muted-foreground">Review community posts and lock or unlock discussions.</p>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading posts...</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    By {post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLock(post)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  {post.isLocked ? 'Unlock' : 'Lock'}
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts found.</p>}
        </div>
      )}
    </div>
  );
}
