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
      load();
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
    return <p className="text-sm text-gray-500">Loading user...</p>;
  }

  if (!form) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error || 'User not found'}</p>
        <Link href="/admin/users" className="text-sm text-primary hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-500">Update role, status, and profile basics.</p>
        </div>
        <Link href="/admin/users" className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Back to Users
        </Link>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input
              required
              value={form.firstName}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, firstName: event.target.value }) : prev)}
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              required
              value={form.lastName}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, lastName: event.target.value }) : prev)}
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, phone: event.target.value }) : prev)}
              placeholder="+254..."
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            <input
              value={form.timezone}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, timezone: event.target.value }) : prev)}
              placeholder="Africa/Nairobi"
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Locale</label>
            <input
              value={form.locale}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, locale: event.target.value }) : prev)}
              placeholder="en"
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, role: event.target.value as UserRole }) : prev)}
              className="input"
            >
              <option value={UserRole.MEMBER}>Member</option>
              <option value={UserRole.PARTNER}>Partner</option>
              <option value={UserRole.COACH}>Coach</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, status: event.target.value as UserStatus }) : prev)}
              className="input"
            >
              <option value={UserStatus.PENDING}>Pending</option>
              <option value={UserStatus.ACTIVE}>Active</option>
              <option value={UserStatus.SUSPENDED}>Suspended</option>
              <option value={UserStatus.DEACTIVATED}>Deactivated</option>
            </select>
          </div>

          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.emailVerified}
              onChange={(event) => setForm((prev) => prev ? ({ ...prev, emailVerified: event.target.checked }) : prev)}
            />
            Email Verified
          </label>

          {error && (
            <p className="md:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/users" className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
