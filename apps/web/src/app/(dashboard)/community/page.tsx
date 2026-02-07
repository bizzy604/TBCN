import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community | Brand Coach Network',
  description: 'Connect with fellow learners and coaches in the community.',
};

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <p className="mt-2 text-muted-foreground">
          Connect, share, and grow with fellow coaches and learners.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">🌐</div>
          <h2 className="text-xl font-semibold">Community Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Discussion forums, community posts, and networking features will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
