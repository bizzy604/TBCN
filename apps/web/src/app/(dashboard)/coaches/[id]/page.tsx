import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach Profile | Brand Coach Network',
  description: 'View coach profile, specializations, and programs.',
};

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coach Profile</h1>
        <p className="mt-2 text-muted-foreground">
          View coach bio, specializations, programs, and reviews.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">👤</div>
          <h2 className="text-xl font-semibold">Coach Profile Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Detailed coach information, programs offered, and client reviews will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
