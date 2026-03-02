import { PhaseTwoPanel } from '@/components/dashboard/phase-two-panel';

export default function UsersPage() {
  return (
    <PhaseTwoPanel
      title="User Management"
      subtitle="Search, filter, and govern user accounts and permissions."
      promptScreen="Screen 29"
      note="The user directory and role management actions are not wired to admin APIs yet and remain phase 2 scope."
    />
  );
}
