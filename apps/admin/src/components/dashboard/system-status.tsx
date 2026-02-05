'use client';

import * as React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Activity,
  Server,
  Database,
  Globe,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

interface SystemService {
  name: string;
  status: ServiceStatus;
  uptime?: string;
  latency?: string;
  icon: React.ElementType;
}

const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  operational: { label: 'Operational', color: 'text-green-500', icon: CheckCircle2 },
  degraded: { label: 'Degraded', color: 'text-yellow-500', icon: AlertCircle },
  down: { label: 'Down', color: 'text-red-500', icon: XCircle },
  maintenance: { label: 'Maintenance', color: 'text-blue-500', icon: Activity },
};

const defaultServices: SystemService[] = [
  { name: 'API Server', status: 'operational', uptime: '99.99%', latency: '45ms', icon: Server },
  { name: 'Database', status: 'operational', uptime: '99.95%', latency: '12ms', icon: Database },
  { name: 'CDN', status: 'operational', uptime: '100%', latency: '8ms', icon: Globe },
  { name: 'Auth Service', status: 'operational', uptime: '99.98%', latency: '28ms', icon: Lock },
];

interface SystemStatusProps {
  services?: SystemService[];
  className?: string;
}

export function SystemStatus({ services = defaultServices, className }: SystemStatusProps) {
  const overallStatus = services.every(s => s.status === 'operational')
    ? 'All Systems Operational'
    : services.some(s => s.status === 'down')
    ? 'System Outage Detected'
    : 'Some Systems Degraded';

  const overallColor = services.every(s => s.status === 'operational')
    ? 'text-green-500'
    : services.some(s => s.status === 'down')
    ? 'text-red-500'
    : 'text-yellow-500';

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">System Status</h3>
        <div className={cn('flex items-center gap-2 text-sm font-medium', overallColor)}>
          <span className="relative flex h-2 w-2">
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', overallColor.replace('text-', 'bg-'))} />
            <span className={cn('relative inline-flex rounded-full h-2 w-2', overallColor.replace('text-', 'bg-'))} />
          </span>
          {overallStatus}
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => {
          const status = statusConfig[service.status];
          const StatusIcon = status.icon;
          const ServiceIcon = service.icon;

          return (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                  <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  {service.uptime && (
                    <p className="text-xs text-muted-foreground">
                      Uptime: {service.uptime}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {service.latency && (
                  <span className="text-xs text-muted-foreground">
                    {service.latency}
                  </span>
                )}
                <div className={cn('flex items-center gap-1.5', status.color)}>
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">{status.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last checked</span>
          <span className="font-medium">Just now</span>
        </div>
      </div>
    </div>
  );
}
