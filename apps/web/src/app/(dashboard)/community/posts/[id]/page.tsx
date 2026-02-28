import type { Metadata } from 'next';
import CommunityPostDetailClient from './CommunityPostDetailClient';

export const metadata: Metadata = {
  title: 'Community Post | Brand Coach Network',
  description: 'View community post and discussion.',
};

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Post</h1>
        <p className="mt-2 text-muted-foreground">View post details and join the discussion.</p>
      </div>

      <CommunityPostDetailClient postId={id} />
    </div>
  );
}
