import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programs | Brand Coach Network',
  description: 'Browse coaching programs and courses available on Brand Coach Network.',
};

export default function ProgramsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
        <p className="mt-2 text-muted-foreground">
          Browse and enroll in coaching programs tailored to your goals.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">📚</div>
          <h2 className="text-xl font-semibold">Programs Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Coaching programs and courses will be available here. Check back soon for new listings.
          </p>
        </div>
      </div>
    </div>
  );
}
