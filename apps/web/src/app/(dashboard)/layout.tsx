import { ProtectedRoute } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-primary">BCN</h1>
              </div>
              
              {/* Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="/dashboard" className="text-foreground hover:text-primary font-medium">
                  Dashboard
                </a>
                <a href="/dashboard/programs" className="text-muted-foreground hover:text-primary">
                  Programs
                </a>
                <a href="/dashboard/community" className="text-muted-foreground hover:text-primary">
                  Community
                </a>
                <a href="/dashboard/coaching" className="text-muted-foreground hover:text-primary">
                  Coaching
                </a>
              </nav>
              
              {/* User menu placeholder */}
              <div className="flex items-center gap-4">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-2 text-foreground hover:text-primary"
                >
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                </a>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
