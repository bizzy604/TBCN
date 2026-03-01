'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth';
import { UserRole } from '@/types';
import { Card } from '@/components/ui/Card';

const PARTNER_ROLES = [UserRole.PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN];

export default function PartnerWorkspacePage() {
  return (
    <ProtectedRoute requiredRoles={PARTNER_ROLES}>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Partner Workspace</h1>
            <p className="text-muted-foreground mt-1">
              Partner-only area for organizational delivery, cohort tracking, and reporting actions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Participant Enrollments</p>
              <p className="mt-2 text-sm">Use program enrollments to track your cohort progress.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Co-branded Content</p>
              <p className="mt-2 text-sm">Coordinate branded initiatives with coach and admin teams.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Performance Analytics</p>
              <p className="mt-2 text-sm">Review outcomes for partner-supported learners and cohorts.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Payments and Invoicing</p>
              <p className="mt-2 text-sm">Manage partner billing workflows and subscription operations.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/enrollments"
              className="rounded-lg border border-border p-4 text-sm hover:bg-muted/30"
            >
              Open Enrollments
            </Link>
            <Link
              href="/programs"
              className="rounded-lg border border-border p-4 text-sm hover:bg-muted/30"
            >
              Browse Programs
            </Link>
          </div>
        </div>
      </Card>
    </ProtectedRoute>
  );
}
