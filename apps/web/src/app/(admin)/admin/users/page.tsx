'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Edit2, Search, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';

const roleStyles: Record<string, string> = {
  super_admin: 'bg-primary text-primary-foreground',
  admin: 'bg-secondary text-secondary-foreground',
  coach: 'bg-accent/25 text-amber-900',
  partner: 'bg-secondary/15 text-secondary',
  member: 'bg-muted text-foreground',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-accent/25 text-amber-900',
  active: 'bg-secondary/15 text-secondary',
  suspended: 'bg-destructive/15 text-destructive',
  deactivated: 'bg-muted text-foreground',
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, role: roleFilter, status: statusFilter, page, limit: 20 }],
    queryFn: () => usersApi.getAll({ search, role: roleFilter, status: statusFilter, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const users = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">Browse and manage user accounts, roles, and status.</p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary">
          <UserPlus size={16} />
          Add User
        </Link>
      </div>

      <section className="card p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),180px,180px]">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users"
              className="input pl-9"
            />
          </label>

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="input">
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
            <option value="partner">Partner</option>
            <option value="member">Member</option>
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/45 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${roleStyles[user.role] || roleStyles.member}`}>{user.role?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${statusStyles[user.status] || statusStyles.pending}`}>{user.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/users/${user.id}/edit`} className="btn btn-sm btn-outline">
                        <Edit2 size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                        className="btn btn-sm btn-outline"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="btn btn-sm btn-outline">
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="btn btn-sm btn-outline">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
