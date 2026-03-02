'use client';

import { useMemo, useState } from 'react';
import {
  useCommunityComments,
  useCommunityPosts,
  useCreateComment,
  useCreatePost,
  useTogglePostReaction,
} from '@/hooks/use-engagement';

const categories = ['all', 'discussion', 'success_story', 'question', 'project'];

export default function CommunityClient() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const postsQuery = useCommunityPosts();
  const createPost = useCreatePost();
  const toggleReaction = useTogglePostReaction();
  const commentsQuery = useCommunityComments(activePostId || '');
  const createComment = useCreateComment(activePostId || '');

  const posts = useMemo(() => {
    const rows = postsQuery.data?.data ?? [];
    if (categoryFilter === 'all') {
      return rows;
    }
    return rows.filter((post) => post.category === categoryFilter);
  }, [postsQuery.data?.data, categoryFilter]);

  const trending = useMemo(() => {
    return [...(postsQuery.data?.data ?? [])]
      .sort((a, b) => (b.reactionCount + b.commentCount) - (a.reactionCount + a.commentCount))
      .slice(0, 5);
  }, [postsQuery.data?.data]);

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
    <div className="grid gap-4 xl:grid-cols-[220px,minmax(0,1fr),260px]">
      <aside className="dashboard-panel h-fit">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Categories</h2>
        <div className="mt-3 space-y-1.5">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategoryFilter(item)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${
                categoryFilter === item ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground hover:bg-muted'
              }`}
            >
              {item.replace('_', ' ')}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <article className="dashboard-panel">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <div className="mt-3 space-y-3">
            <input
              className="input"
              placeholder="Post title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              className="input min-h-[120px]"
              rows={4}
              placeholder="Share something with the community"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <button type="button" onClick={handleCreatePost} disabled={createPost.isPending} className="btn btn-primary">
              {createPost.isPending ? 'Posting...' : 'Publish Post'}
            </button>
          </div>
        </article>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <div className="space-y-3">
          {postsQuery.isLoading ? (
            [1, 2, 3].map((index) => <div key={index} className="card h-36 animate-pulse bg-muted/55" />)
          ) : posts.length === 0 ? (
            <div className="card p-10 text-center text-sm text-muted-foreground">No posts yet in this category.</div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {post.author?.firstName} {post.author?.lastName} · {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="badge-brand capitalize">{post.category.replace('_', ' ')}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.content}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => toggleReaction.mutate({ postId: post.id })}
                    className="btn btn-sm btn-outline"
                  >
                    Like ({post.reactionCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePostId((prev) => (prev === post.id ? null : post.id))}
                    className="btn btn-sm btn-outline"
                  >
                    Comments ({post.commentCount})
                  </button>
                </div>

                {activePostId === post.id && (
                  <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
                    {commentsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading comments...</p>
                    ) : (
                      <div className="space-y-2">
                        {(commentsQuery.data ?? []).map((comment) => (
                          <div key={comment.id} className="rounded-lg border border-border bg-card p-2 text-sm">
                            <p className="font-semibold text-foreground">
                              {comment.author?.firstName} {comment.author?.lastName}
                            </p>
                            <p className="text-muted-foreground">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        className="input"
                        placeholder="Add a comment"
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                      />
                      <button type="button" onClick={handleCreateComment} disabled={createComment.isPending} className="btn btn-primary">
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="dashboard-panel h-fit">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Trending</h2>
        <div className="mt-3 space-y-2">
          {trending.map((post) => (
            <div key={post.id} className="rounded-lg border border-border bg-background p-3">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{post.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{post.reactionCount + post.commentCount} interactions</p>
            </div>
          ))}
          {!trending.length && <p className="text-sm text-muted-foreground">No trending posts yet.</p>}
        </div>
      </aside>
    </div>
  );
}
