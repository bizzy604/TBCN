export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Details</h1>
        <p className="text-muted-foreground mt-1">View user ID: {id}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-muted-foreground">User details coming soon...</p>
      </div>
    </div>
  );
}