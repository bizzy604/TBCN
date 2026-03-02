'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Briefcase, Globe, Linkedin, LogOut, Mail, MapPin, Phone, Shield, Twitter, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks';

export default function ProfileSettingsPage() {
  const { user, logout, isLoading } = useAuth();

  const completion = useMemo(() => {
    if (!user) return 0;
    const checks = [user.firstName, user.lastName, user.email, user.phone, user.avatarUrl, user.timezone];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [user]);

  if (isLoading) {
    return <div className="card h-72 animate-pulse bg-muted/55" />;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="h-36 bg-gradient-to-r from-sidebar via-secondary/70 to-accent/70" />
      <div className="space-y-6 p-5 sm:p-6">
        <div className="-mt-16 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-muted">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                  {user?.firstName?.[0] || 'U'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{user?.firstName} {user?.lastName}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge-brand capitalize">{user?.role?.replace('_', ' ') || 'Member'}</span>
                <span className="badge bg-muted text-foreground">Profile {completion}%</span>
              </div>
            </div>
          </div>

          <Link href="/settings/profile/edit" className="btn btn-primary">
            Edit Profile
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="card p-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow icon={<User size={16} />} label="Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email || 'Not set'} />
              <InfoRow icon={<Phone size={16} />} label="Phone" value={user?.phone || 'Not set'} />
              <InfoRow icon={<MapPin size={16} />} label="Location" value="Not set" />
              <InfoRow icon={<Globe size={16} />} label="Timezone" value={user?.timezone || 'UTC'} />
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-lg font-semibold">Professional</h2>
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow icon={<Briefcase size={16} />} label="Company" value="Not set" />
              <InfoRow icon={<Briefcase size={16} />} label="Job Title" value="Not set" />
              <InfoRow icon={<Globe size={16} />} label="Website" value="Not set" />
              <InfoRow icon={<Linkedin size={16} />} label="LinkedIn" value="Not connected" />
              <InfoRow icon={<Twitter size={16} />} label="X / Twitter" value="Not connected" />
            </div>
          </section>
        </div>

        <section className="card divide-y divide-border">
          <SettingsLink href="/settings/profile/edit" title="Edit Profile" description="Update personal and professional details" />
          <SettingsLink href="/settings/security" title="Security" description="Password and account protection" icon={<Shield size={16} />} />
          <SettingsLink href="/settings/subscription" title="Subscription" description="Billing, plan, and transaction history" />
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/8"
            type="button"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </section>
      </div>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SettingsLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/55">
      <div className="flex items-center gap-3">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-secondary">Open</span>
    </Link>
  );
}
