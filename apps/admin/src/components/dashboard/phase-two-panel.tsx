import { Layers3 } from 'lucide-react';

interface PhaseTwoPanelProps {
  title: string;
  subtitle: string;
  promptScreen: string;
  note: string;
}

export function PhaseTwoPanel({ title, subtitle, promptScreen, note }: PhaseTwoPanelProps) {
  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="bg-sidebar px-6 py-6 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
            {promptScreen}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-sidebar-foreground/85">{subtitle}</p>
        </div>
      </section>

      <section className="phase-two-card">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border border-border bg-background/80 p-2">
            <Layers3 className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Planned for Phase 2</h3>
            <p className="mt-1 text-sm text-muted-foreground">{note}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
