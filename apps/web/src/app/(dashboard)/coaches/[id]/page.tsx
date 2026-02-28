import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CoachDetailClient from './CoachDetailClient';

export const metadata: Metadata = {
  title: 'Coach Profile | Brand Coach Network',
  description: 'View coach profile, availability, and book a session.',
};

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coach Profile</h1>
          <p className="mt-2 text-muted-foreground">Review coach details and reserve a session slot.</p>
        </div>
        <CoachDetailClient coachId={id} />
      </div>
    </Card>
  );
}

