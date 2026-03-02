export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card p-8 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
