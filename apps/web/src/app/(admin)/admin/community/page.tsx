'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCommunityPosts } from '@/hooks';

export default function AdminCommunityPage() {
  const { data, isLoading, error } = useCommunityPosts({ page: 1, limit: 50 });
  const rows = data?.data ?? [];

  const metrics = useMemo(() => {
    const postCount = rows.length;
    const lockedCount = rows.filter((post) => post.isLocked).length;
    const totalComments = rows.reduce((sum, post) => sum + (post.commentCount || 0), 0);
    return { postCount, lockedCount, totalComments };
  }, [rows]);

  const errorMessage =
    (error as any)?.error?.message ||
    (error as any)?.message ||
    null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground">Track post activity and jump to moderation when needed.</p>
        </div>
        <Link
          href="/admin/moderation"
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Open Moderation
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Posts Loaded</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.postCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Locked Posts</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.lockedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Comments</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.totalComments}</p>
        </div>
      </section>

      {errorMessage && <p className="text-sm text-muted-foreground">{errorMessage}</p>}

      <section className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Recent Community Posts</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading posts...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts available.</p>
        ) : (
          <table className="w-full min-w-[940px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Author</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Comments</th>
                <th className="px-2 py-2">Reactions</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((post) => (
                <tr key={post.id} className="border-b border-border/60">
                  <td className="px-2 py-2 font-medium">{post.title}</td>
                  <td className="px-2 py-2">
                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : post.authorId}
                  </td>
                  <td className="px-2 py-2 capitalize">{post.category}</td>
                  <td className="px-2 py-2">{post.commentCount}</td>
                  <td className="px-2 py-2">{post.reactionCount}</td>
                  <td className="px-2 py-2">{post.isLocked ? 'Locked' : 'Open'}</td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/community/posts/${post.id}`}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      View Post
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
