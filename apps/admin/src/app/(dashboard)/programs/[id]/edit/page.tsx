export default function EditProgramPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Program</h1>
        <p className="text-muted-foreground mt-1">Edit program ID: {params.id}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-muted-foreground">Edit program form coming soon...</p>
      </div>
    </div>
  );
}