'use client';

import * as React from 'react';
import { 
  UserPlus, 
  FileText, 
  Settings, 
  Mail, 
  Download, 
  Upload,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

const defaultActions: QuickAction[] = [
  {
    title: 'Add User',
    description: 'Create a new user account',
    icon: UserPlus,
    variant: 'primary',
  },
  {
    title: 'New Report',
    description: 'Generate analytics report',
    icon: FileText,
  },
  {
    title: 'Send Notification',
    description: 'Broadcast to all users',
    icon: Mail,
  },
  {
    title: 'Export Data',
    description: 'Download as CSV/Excel',
    icon: Download,
  },
  {
    title: 'Import Data',
    description: 'Bulk upload users/content',
    icon: Upload,
  },
  {
    title: 'Settings',
    description: 'Configure platform',
    icon: Settings,
  },
];

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActions({ actions = defaultActions, className }: QuickActionsProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg p-4 text-center transition-all',
                'hover:shadow-md',
                action.variant === 'primary'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  action.variant === 'primary'
                    ? 'bg-primary-foreground/20'
                    : 'bg-background'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{action.title}</p>
                <p
                  className={cn(
                    'text-xs mt-0.5',
                    action.variant === 'primary'
                      ? 'opacity-80'
                      : 'text-muted-foreground'
                  )}
                >
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
