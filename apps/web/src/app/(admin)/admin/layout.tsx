'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminRoute } from '@/components/auth';
import { useAuth } from '@/hooks';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell,
} from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/programs', icon: BookOpen, label: 'Programs' },
  { href: '/admin/coaching', icon: Calendar, label: 'Coaching' },
  { href: '/admin/community', icon: MessageSquare, label: 'Community' },
  { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/moderation', icon: Shield, label: 'Moderation' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BCN</span>
              </div>
              <span className="text-white font-semibold">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-gray-400 text-sm truncate capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Go to main site */}
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-primary-600"
              >
                View Site
              </Link>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminRoute>
  );
}
