import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community | Brand Coach Network',
  description: 'Connect with fellow learners and coaches in the community.',
};

export default function CommunityPage() {
  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <p className="mt-2 text-muted-foreground">Connect, share wins, and ask questions with your peers.</p>
        </div>
        <CommunityClient />
      </div>
    </Card>
  );
}

