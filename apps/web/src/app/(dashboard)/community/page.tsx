import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CommunityClient from './CommunityClient';

export const metadata: Metadata = {
  title: 'Community Hub | Brand Coach Network',
  description: 'Share, discuss, and collaborate with other members and coaches.',
};

export default function CommunityPage() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Community Hub</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Conversations and Collaboration</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Discuss ideas, celebrate wins, and ask practical questions.</p>
      </div>
      <div className="p-5 sm:p-6">
        <CommunityClient />
      </div>
    </Card>
  );
}
