'use client';

import * as React from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
type UserRole = 'admin' | 'coach' | 'member' | 'partner';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: Date;
  lastActive?: Date;
}

const statusConfig: Record<UserStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'text-green-500 bg-green-500/10', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'text-gray-500 bg-gray-500/10', icon: XCircle },
  pending: { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/10', icon: Clock },
  suspended: { label: 'Suspended', color: 'text-red-500 bg-red-500/10', icon: XCircle },
};

const roleConfig: Record<UserRole, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'bg-primary/10 text-primary' },
  coach: { label: 'Coach', color: 'bg-secondary/10 text-secondary' },
  member: { label: 'Member', color: 'bg-muted text-muted-foreground' },
  partner: { label: 'Partner', color: 'bg-accent/10 text-accent' },
};

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'coach',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'member',
    status: 'active',
    joinedAt: new Date('2024-02-20'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'partner',
    status: 'pending',
    joinedAt: new Date('2024-03-10'),
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2023-11-05'),
    lastActive: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '5',
    name: 'Chris Brown',
    email: 'chris@example.com',
    role: 'member',
    status: 'suspended',
    joinedAt: new Date('2024-01-28'),
  },
];

interface UsersTableProps {
  users?: User[];
  className?: string;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UsersTable({
  users = sampleUsers,
  className,
  onView,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Recent Users</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedUsers.map((user) => {
              const status = statusConfig[user.status];
              const role = roleConfig[user.role];
              const StatusIcon = status.icon;

              return (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        role.color
                      )}
                    >
                      {role.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className={cn('flex items-center gap-1.5', status.color)}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(user.joinedAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView?.(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(user)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
          {filteredUsers.length} users
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
