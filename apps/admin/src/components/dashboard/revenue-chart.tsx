'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface RevenueData {
  name: string;
  revenue: number;
  subscriptions: number;
  oneTime: number;
}

const sampleData: RevenueData[] = [
  { name: 'Jan', revenue: 4000, subscriptions: 2400, oneTime: 1600 },
  { name: 'Feb', revenue: 3000, subscriptions: 1398, oneTime: 1602 },
  { name: 'Mar', revenue: 5000, subscriptions: 3800, oneTime: 1200 },
  { name: 'Apr', revenue: 4780, subscriptions: 3908, oneTime: 872 },
  { name: 'May', revenue: 5890, subscriptions: 4800, oneTime: 1090 },
  { name: 'Jun', revenue: 6390, subscriptions: 3800, oneTime: 2590 },
  { name: 'Jul', revenue: 7490, subscriptions: 4300, oneTime: 3190 },
  { name: 'Aug', revenue: 8200, subscriptions: 5100, oneTime: 3100 },
  { name: 'Sep', revenue: 7800, subscriptions: 4900, oneTime: 2900 },
  { name: 'Oct', revenue: 9100, subscriptions: 5800, oneTime: 3300 },
  { name: 'Nov', revenue: 10200, subscriptions: 6400, oneTime: 3800 },
  { name: 'Dec', revenue: 11500, subscriptions: 7200, oneTime: 4300 },
];

interface RevenueChartProps {
  data?: RevenueData[];
  className?: string;
}

export function RevenueChart({ data = sampleData, className }: RevenueChartProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue breakdown</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Subscriptions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">One-time</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--border)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickLine={{ stroke: 'var(--border)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Total Revenue"
            />
            <Area
              type="monotone"
              dataKey="subscriptions"
              stroke="var(--secondary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubscriptions)"
              name="Subscriptions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
