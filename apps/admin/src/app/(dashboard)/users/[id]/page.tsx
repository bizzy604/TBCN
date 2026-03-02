import { PhaseTwoPanel } from '@/components/dashboard/phase-two-panel';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <PhaseTwoPanel
      title="User Profile"
      subtitle={`User ID: ${id}`}
      promptScreen="Screen 29"
      note="Profile side panels, activity history, and role controls are planned for phase 2."
    />
  );
}
