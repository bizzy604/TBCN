'use client';

import { useState } from 'react';
import {
  useCommunityPosts,
  useCreatePost,
  useCreateComment,
  useCommunityComments,
  useTogglePostReaction,
} from '@/hooks/use-engagement';

export default function CommunityClient() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const postsQuery = useCommunityPosts();
  const createPost = useCreatePost();
  const toggleReaction = useTogglePostReaction();
  const commentsQuery = useCommunityComments(activePostId || '');
  const createComment = useCreateComment(activePostId || '');

  const posts = postsQuery.data?.data ?? [];

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage('Title and content are required.');
      return;
    }
    setMessage(null);
    try {
      await createPost.mutateAsync({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to create post');
    }
  };

  const handleCreateComment = async () => {
    if (!activePostId || !commentText.trim()) return;
    setMessage(null);
    try {
      await createComment.mutateAsync({ content: commentText.trim() });
      setCommentText('');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Create Post</h2>
        <div className="mt-3 space-y-3">
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            rows={4}
            placeholder="Share your update or question"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="button"
            onClick={handleCreatePost}
            disabled={createPost.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {createPost.isPending ? 'Posting...' : 'Publish Post'}
          </button>
        </div>
      </section>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <section className="space-y-4">
        {postsQuery.isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-lg border border-border bg-muted/30" />
          ))
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            No posts yet. Start the conversation.
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    By {post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full border border-border px-2 py-1 text-xs capitalize">{post.category}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => toggleReaction.mutate({ postId: post.id })}
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
                >
                  React ({post.reactionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePostId((prev) => (prev === post.id ? null : post.id))}
                  className="rounded-md border border-border px-3 py-1.5 hover:bg-muted"
                >
                  Comments ({post.commentCount})
                </button>
              </div>

              {activePostId === post.id && (
                <div className="mt-4 space-y-3 rounded-md border border-border p-3">
                  {commentsQuery.isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading comments...</div>
                  ) : (
                    <div className="space-y-2">
                      {(commentsQuery.data ?? []).map((comment) => (
                        <div key={comment.id} className="rounded-md bg-muted/30 p-2 text-sm">
                          <p className="font-medium">
                            {comment.author?.firstName} {comment.author?.lastName}
                          </p>
                          <p className="text-muted-foreground">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Add a comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleCreateComment}
                      disabled={createComment.isPending}
                      className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

