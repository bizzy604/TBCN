import { PhaseTwoPanel } from '@/components/dashboard/phase-two-panel';

export default function ContentModerationPage() {
  return (
    <PhaseTwoPanel
      title="Content Approval Queue"
      subtitle="Review pending courses, posts, events, and coach profiles."
      promptScreen="Screen 30"
      note="This module currently has placeholder UI only. Approval workflow and moderation actions are planned for phase 2."
    />
  );
}
