import { api } from './client';

export type PostCategory = 'general' | 'question' | 'win' | 'resource';
export type ReactionType = 'like' | 'celebrate' | 'insightful';

export interface CommunityPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: PostCategory;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  commentCount: number;
  reactionCount: number;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  reactionCount: number;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCommunityPosts {
  data: CommunityPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CommunityQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: PostCategory;
}

export const communityApi = {
  listPosts: (params?: CommunityQuery) =>
    api.getRaw<PaginatedCommunityPosts>('/community/posts', { params }),

  getPost: (id: string) =>
    api.get<CommunityPost>(`/community/posts/${id}`),

  createPost: (payload: { title: string; content: string; category?: PostCategory; tags?: string[] }) =>
    api.post<CommunityPost>('/community/posts', payload),

  updatePost: (id: string, payload: Partial<{ title: string; content: string; category: PostCategory; tags: string[] }>) =>
    api.patch<CommunityPost>(`/community/posts/${id}`, payload),

  deletePost: (id: string) =>
    api.delete<{ success: boolean }>(`/community/posts/${id}`),

  listComments: (postId: string) =>
    api.get<CommunityComment[]>(`/community/posts/${postId}/comments`),

  addComment: (postId: string, payload: { content: string }) =>
    api.post<CommunityComment>(`/community/posts/${postId}/comments`, payload),

  deleteComment: (id: string) =>
    api.delete<{ success: boolean }>(`/community/comments/${id}`),

  togglePostReaction: (postId: string, type: ReactionType = 'like') =>
    api.post<{ reacted: boolean }>(`/community/posts/${postId}/reactions`, { type }),

  toggleCommentReaction: (commentId: string, type: ReactionType = 'like') =>
    api.post<{ reacted: boolean }>(`/community/comments/${commentId}/reactions`, { type }),
};

