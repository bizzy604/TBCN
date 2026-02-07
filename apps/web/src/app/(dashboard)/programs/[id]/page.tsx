import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Program Details | Brand Coach Network',
  description: 'View program details, curriculum, and enrollment options.',
};

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Program Details</h1>
        <p className="mt-2 text-muted-foreground">
          View program curriculum, schedule, and enrollment details.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">📖</div>
          <h2 className="text-xl font-semibold">Program Details Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Detailed program information, lessons, and enrollment options will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
