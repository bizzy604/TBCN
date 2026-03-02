import { PhaseTwoPanel } from '@/components/dashboard/phase-two-panel';

export default function SettingsPage() {
  return (
    <PhaseTwoPanel
      title="System Settings"
      subtitle="Governance and platform-level configuration."
      promptScreen="Unified Admin Nav"
      note="System-level configuration controls are pending full admin API support in phase 2."
    />
  );
}
