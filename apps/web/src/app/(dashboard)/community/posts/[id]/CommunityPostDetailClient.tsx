'use client';

import { useState } from 'react';
import { useCommunityComments } from '@/hooks/use-engagement';
import { communityApi } from '@/lib/api/community';
import { useQuery } from '@tanstack/react-query';

interface CommunityPostDetailClientProps {
  postId: string;
}

export default function CommunityPostDetailClient({ postId }: CommunityPostDetailClientProps) {
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const postQuery = useQuery({
    queryKey: ['community', 'post', postId],
    queryFn: () => communityApi.getPost(postId),
    enabled: !!postId,
  });

  const commentsQuery = useCommunityComments(postId);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setMessage(null);
    try {
      await communityApi.addComment(postId, { content: comment.trim() });
      await commentsQuery.refetch();
      await postQuery.refetch();
      setComment('');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to post comment');
    }
  };

  if (postQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!postQuery.data) {
    return <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8">Post not found.</div>;
  }

  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <article className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-2xl font-semibold">{post.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleString()}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{post.content}</p>
      </article>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-lg font-semibold">Discussion ({comments.length})</h3>

        <div className="mt-4 space-y-3">
          {comments.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-muted/20 p-3">
              <p className="text-sm font-medium">{item.author?.firstName} {item.author?.lastName}</p>
              <p className="text-sm text-muted-foreground">{item.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your response"
          />
          <button
            type="button"
            onClick={handleComment}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Comment
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
      </section>
    </div>
  );
}
