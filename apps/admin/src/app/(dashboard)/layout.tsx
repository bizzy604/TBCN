export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
            <span className="font-semibold text-lg text-sidebar-foreground">TBCN Admin</span>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="/" className="block px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">Dashboard</a>
            <a href="/analytics" className="block px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">Analytics</a>
            <a href="/users" className="block px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">Users</a>
            <a href="/programs" className="block px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">Programs</a>
            <a href="/transactions" className="block px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">Transactions</a>
            <a href="/settings" className="block px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50">Settings</a>
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 md:pl-64">
          <header className="h-16 border-b border-border flex items-center px-6 bg-background sticky top-0 z-10">
            <h1 className="font-semibold text-foreground">Dashboard</h1>
          </header>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
