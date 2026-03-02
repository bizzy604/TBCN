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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create User</h1>
          <p className="text-sm text-muted-foreground">Add a new user account to the platform.</p>
        </div>
        <Link href="/admin/users" className="btn btn-outline">
          Back to Users
        </Link>
      </div>

      <section className="card p-5">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label>
            <span className="label">First Name</span>
            <input required value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} placeholder="Alice" className="input" />
          </label>

          <label>
            <span className="label">Last Name</span>
            <input required value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} placeholder="Otieno" className="input" />
          </label>

          <label className="md:col-span-2">
            <span className="label">Email Address</span>
            <input required type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="user@example.com" className="input" />
          </label>

          <label>
            <span className="label">Role</span>
            <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))} className="input">
              <option value={UserRole.MEMBER}>Member</option>
              <option value={UserRole.PARTNER}>Partner</option>
              <option value={UserRole.COACH}>Coach</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
            </select>
          </label>

          <label>
            <span className="label">Temporary Password</span>
            <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="At least 8 characters" className="input" />
            <p className="mt-1 text-xs text-muted-foreground">User can reset this later through forgot-password flow.</p>
          </label>

          {error && <p className="md:col-span-2 rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Creating...' : 'Create User'}
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
