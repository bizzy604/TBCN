import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CoachesClient from './CoachesClient';

export const metadata: Metadata = {
  title: 'Coaches | Brand Coach Network',
  description: 'Discover expert coaches on Brand Coach Network.',
};

export default function CoachesPage() {
  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coaches</h1>
          <p className="mt-2 text-muted-foreground">Discover experienced coaches and book sessions.</p>
        </div>
        <CoachesClient />
      </div>
    </Card>
  );
}

