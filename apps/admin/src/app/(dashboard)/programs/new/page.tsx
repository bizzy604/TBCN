import { ProgramForm } from '@/components/content/ProgramForm';

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="bg-sidebar px-6 py-6 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
            Screen 31
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
            Create Program
          </h2>
          <p className="mt-2 text-sm text-sidebar-foreground/85">
            Build the course structure, configure pricing, then publish when ready.
          </p>
        </div>
      </section>
      <ProgramForm mode="create" />
    </div>
  );
}
