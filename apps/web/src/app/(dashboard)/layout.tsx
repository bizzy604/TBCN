import { ProtectedRoute } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-primary-600">BCN</h1>
              </div>
              
              {/* Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                  Dashboard
                </a>
                <a href="/dashboard/programs" className="text-gray-500 hover:text-primary-600">
                  Programs
                </a>
                <a href="/dashboard/community" className="text-gray-500 hover:text-primary-600">
                  Community
                </a>
                <a href="/dashboard/coaching" className="text-gray-500 hover:text-primary-600">
                  Coaching
                </a>
              </nav>
              
              {/* User menu placeholder */}
              <div className="flex items-center gap-4">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-600"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
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
