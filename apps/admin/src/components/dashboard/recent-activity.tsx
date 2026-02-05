'use client';

import * as React from 'react';
import { 
  UserPlus, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  MessageSquare,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'user' | 'payment' | 'alert' | 'success' | 'content' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

const typeConfig: Record<Activity['type'], { icon: LucideIcon; color: string }> = {
  user: { icon: UserPlus, color: 'text-blue-500 bg-blue-500/10' },
  payment: { icon: CreditCard, color: 'text-green-500 bg-green-500/10' },
  alert: { icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-500/10' },
  success: { icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
  content: { icon: FileText, color: 'text-purple-500 bg-purple-500/10' },
  message: { icon: MessageSquare, color: 'text-cyan-500 bg-cyan-500/10' },
};

const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'user',
    title: 'New user registered',
    description: 'John Doe created an account',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: { name: 'John Doe' },
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment received',
    description: '$299 for Premium Program',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: { name: 'Jane Smith' },
  },
  {
    id: '3',
    type: 'alert',
    title: 'Content flagged',
    description: 'Post requires moderation review',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '4',
    type: 'success',
    title: 'Program completed',
    description: 'Sarah completed Brand Mastery',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    user: { name: 'Sarah Johnson' },
  },
  {
    id: '5',
    type: 'content',
    title: 'New content published',
    description: 'Module 5 is now live',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
];

interface RecentActivityProps {
  activities?: Activity[];
  className?: string;
  maxItems?: number;
}

export function RecentActivity({
  activities = sampleActivities,
  className,
  maxItems = 5,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      
      <div className="space-y-4">
        {displayActivities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;
          
          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 pb-4',
                index !== displayActivities.length - 1 && 'border-b border-border'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
