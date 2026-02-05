'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  UserCog,
  MessageSquare,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Users', href: '/dashboard/users', icon: Users, badge: '12' },
      { title: 'Partners', href: '/dashboard/partners', icon: UserCog },
      { title: 'Programs', href: '/dashboard/programs', icon: BookOpen },
      { title: 'Content', href: '/dashboard/content-moderation', icon: Folder },
    ],
  },
  {
    title: 'Financial',
    items: [
      { title: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Moderation', href: '/dashboard/moderation', icon: Shield, badge: '3' },
      { title: 'Reports', href: '/dashboard/reports', icon: FileText },
      { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="font-heading font-semibold text-lg">TBCN Admin</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Sparkles className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={section.title} className={cn(idx > 0 && 'mt-6')}>
              {!collapsed && (
                <h3 className="mb-2 px-3 text-xs font-medium text-sidebar-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {collapsed && idx > 0 && <Separator className="my-4 bg-sidebar-border" />}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary px-1.5 text-xs font-medium text-sidebar-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        linkContent
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2">
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>

          {/* User / Logout */}
          {!collapsed && (
            <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 bg-sidebar-accent/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-sidebar-muted-foreground truncate">admin@tbcn.com</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-muted-foreground hover:text-sidebar-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          {collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full mt-2 text-sidebar-muted-foreground hover:text-sidebar-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
