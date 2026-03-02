export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden border-r border-sidebar-border bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground">
              The Brand Coach Network
            </p>
            <h1 className="max-w-lg text-4xl font-semibold leading-tight text-white">
              Everyone is a Brand
            </h1>
            <p className="max-w-md text-sm text-sidebar-foreground/80">
              A focused journey for African professionals building visibility, confidence, and measurable business impact.
            </p>
          </div>

          <div className="space-y-4">
            <blockquote className="rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-5 text-sm leading-relaxed text-sidebar-foreground/85">
              "The platform gave me practical structure and accountability. I moved from ideas to a clear brand in weeks."
            </blockquote>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-4">
                <p className="text-2xl font-semibold text-white">5,000+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-sidebar-foreground/70">Active Members</p>
              </div>
              <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/35 p-4">
                <p className="text-2xl font-semibold text-white">120+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-sidebar-foreground/70">Programs</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-16">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
