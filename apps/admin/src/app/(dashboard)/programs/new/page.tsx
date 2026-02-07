import { ProgramForm } from '@/components/content/ProgramForm';

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Program</h1>
        <p className="text-muted-foreground mt-1">Create a new coaching program with modules and lessons.</p>
      </div>
      <ProgramForm mode="create" />
    </div>
  );
}