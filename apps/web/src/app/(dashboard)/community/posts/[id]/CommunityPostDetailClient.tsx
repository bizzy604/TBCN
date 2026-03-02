'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCommunityComments } from '@/hooks/use-engagement';
import { communityApi } from '@/lib/api/community';

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
    return <div className="card h-64 animate-pulse bg-muted/55" />;
  }

  if (!postQuery.data) {
    return <div className="card p-8 text-sm text-muted-foreground">Post not found.</div>;
  }

  const post = postQuery.data;
  const comments = commentsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <article className="card p-5">
        <h2 className="text-2xl font-semibold text-foreground">{post.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {post.author?.firstName} {post.author?.lastName} · {new Date(post.createdAt).toLocaleString()}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </article>

      <section className="card p-5">
        <h3 className="text-lg font-semibold">Discussion ({comments.length})</h3>

        <div className="mt-4 space-y-2">
          {comments.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border bg-background p-3">
              <p className="text-sm font-semibold text-foreground">
                {entry.author?.firstName} {entry.author?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{entry.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input className="input" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add your response" />
          <button type="button" onClick={handleComment} className="btn btn-primary">
            Comment
          </button>
        </div>

        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </section>
    </div>
  );
}
