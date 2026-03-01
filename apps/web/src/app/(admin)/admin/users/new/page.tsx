'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { UserRole } from '@/types';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

const defaultForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: UserRole.MEMBER,
};

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await usersApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      toast.success('User created successfully');
      router.push('/admin/users');
    } catch (e: any) {
      setError(e?.error?.message || e?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create User</h1>
          <p className="text-gray-500">Add a new user account to the platform.</p>
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
              onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              placeholder="e.g. Alice"
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input
              required
              value={form.lastName}
              onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              placeholder="e.g. Otieno"
              className="input"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="user@example.com"
              className="input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
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
            <label className="text-sm font-medium text-gray-700">Temporary Password</label>
            <input
              required
              minLength={8}
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="At least 8 characters"
              className="input"
            />
            <p className="text-xs text-gray-500">
              User can reset this later through the forgot password flow.
            </p>
          </div>

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
              {submitting ? 'Creating...' : 'Create User'}
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
