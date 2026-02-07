import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coaches | Brand Coach Network',
  description: 'Discover expert coaches on Brand Coach Network.',
};

export default function CoachesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coaches</h1>
        <p className="mt-2 text-muted-foreground">
          Discover experienced coaches and find the right fit for your journey.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">👨‍🏫</div>
          <h2 className="text-xl font-semibold">Coach Directory Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Browse coach profiles, specializations, reviews, and availability here.
          </p>
        </div>
      </div>
    </div>
  );
}
