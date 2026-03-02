import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CommunityPostDetailClient from './CommunityPostDetailClient';

export const metadata: Metadata = {
  title: 'Community Post | Brand Coach Network',
  description: 'View post details and join the discussion.',
};

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Community Post</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Discussion Thread</h1>
      </div>
      <div className="p-5 sm:p-6">
        <CommunityPostDetailClient postId={id} />
      </div>
    </Card>
  );
}
