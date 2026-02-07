import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Post | Brand Coach Network',
  description: 'View community post and discussion.',
};

export default function CommunityPostPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Post</h1>
        <p className="mt-2 text-muted-foreground">
          View post details and join the discussion.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">💭</div>
          <h2 className="text-xl font-semibold">Post Content Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Post content, comments, and replies will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
