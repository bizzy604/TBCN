'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { UserRole, UserStatus } from '@/types';

type EditFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  timezone: string;
  locale: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

export default function AdminEditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EditFormState | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await usersApi.getById(userId);
        setForm({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          timezone: user.timezone || '',
          locale: user.locale || '',
          role: user.role,
          status: user.status,
          emailVerified: Boolean(user.emailVerified),
        });
      } catch (e: any) {
        setError(e?.error?.message || e?.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      void load();
    }
  }, [userId]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    setSubmitting(true);
    setError(null);
    try {
      await usersApi.update(userId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || undefined,
        timezone: form.timezone.trim() || undefined,
        locale: form.locale.trim() || undefined,
        role: form.role,
        status: form.status,
        emailVerified: form.emailVerified,
      });
      toast.success('User updated successfully');
      router.push('/admin/users');
    } catch (e: any) {
      setError(e?.error?.message || e?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading user...</p>;
  }

  if (!form) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error || 'User not found'}</p>
        <Link href="/admin/users" className="text-sm font-medium text-secondary hover:text-primary">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit User</h1>
          <p className="text-sm text-muted-foreground">Update role, status, and profile basics.</p>
        </div>
        <Link href="/admin/users" className="btn btn-outline">
          Back to Users
        </Link>
      </div>

      <section className="card p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label>
            <span className="label">First Name</span>
            <input required value={form.firstName} onChange={(event) => setForm((prev) => prev ? ({ ...prev, firstName: event.target.value }) : prev)} className="input" />
          </label>

          <label>
            <span className="label">Last Name</span>
            <input required value={form.lastName} onChange={(event) => setForm((prev) => prev ? ({ ...prev, lastName: event.target.value }) : prev)} className="input" />
          </label>

          <label>
            <span className="label">Phone</span>
            <input value={form.phone} onChange={(event) => setForm((prev) => prev ? ({ ...prev, phone: event.target.value }) : prev)} placeholder="+254..." className="input" />
          </label>

          <label>
            <span className="label">Timezone</span>
            <input value={form.timezone} onChange={(event) => setForm((prev) => prev ? ({ ...prev, timezone: event.target.value }) : prev)} placeholder="Africa/Nairobi" className="input" />
          </label>

          <label>
            <span className="label">Locale</span>
            <input value={form.locale} onChange={(event) => setForm((prev) => prev ? ({ ...prev, locale: event.target.value }) : prev)} placeholder="en" className="input" />
          </label>

          <label>
            <span className="label">Role</span>
            <select value={form.role} onChange={(event) => setForm((prev) => prev ? ({ ...prev, role: event.target.value as UserRole }) : prev)} className="input">
              <option value={UserRole.MEMBER}>Member</option>
              <option value={UserRole.PARTNER}>Partner</option>
              <option value={UserRole.COACH}>Coach</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </label>

          <label>
            <span className="label">Status</span>
            <select value={form.status} onChange={(event) => setForm((prev) => prev ? ({ ...prev, status: event.target.value as UserStatus }) : prev)} className="input">
              <option value={UserStatus.PENDING}>Pending</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.SUSPENDED}>Suspended</option>
              <option value={UserStatus.DEACTIVATED}>Deactivated</option>
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.emailVerified} onChange={(event) => setForm((prev) => prev ? ({ ...prev, emailVerified: event.target.checked }) : prev)} />
            Email Verified
          </label>

          {error && <p className="md:col-span-2 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/users" className="btn btn-outline">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
