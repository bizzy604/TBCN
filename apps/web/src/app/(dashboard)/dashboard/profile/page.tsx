'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Twitter, 
  Camera,
  Edit2,
  Shield,
  Bell,
  LogOut,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>
        <Link href="/dashboard/profile/edit" className="btn-primary">
          <Edit2 size={16} className="mr-2" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-purple-600"></div>
        
        {/* Avatar and Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <User size={32} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* User Info */}
          <div className="pt-16">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-500">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
              {user?.emailVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <InfoRow icon={<User size={18} />} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
            <InfoRow icon={<Mail size={18} />} label="Email" value={user?.email || '-'} />
            <InfoRow icon={<Phone size={18} />} label="Phone" value={user?.phone || 'Not set'} />
            <InfoRow icon={<MapPin size={18} />} label="Location" value="Not set" />
            <InfoRow icon={<Globe size={18} />} label="Timezone" value={user?.timezone || 'UTC'} />
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Professional Details</h3>
          <div className="space-y-4">
            <InfoRow icon={<Briefcase size={18} />} label="Company" value="Not set" />
            <InfoRow icon={<Briefcase size={18} />} label="Job Title" value="Not set" />
            <InfoRow icon={<Globe size={18} />} label="Website" value="Not set" />
            <InfoRow icon={<Linkedin size={18} />} label="LinkedIn" value="Not connected" />
            <InfoRow icon={<Twitter size={18} />} label="Twitter" value="Not connected" />
          </div>
        </div>
      </div>

      {/* Settings Links */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <SettingsLink
          href="/dashboard/profile/edit"
          icon={<Edit2 size={20} />}
          title="Edit Profile"
          description="Update your personal and professional information"
        />
        <SettingsLink
          href="/dashboard/settings/security"
          icon={<Shield size={20} />}
          title="Security Settings"
          description="Change password, enable 2FA, manage sessions"
        />
        <SettingsLink
          href="/dashboard/settings/notifications"
          icon={<Bell size={20} />}
          title="Notification Preferences"
          description="Manage email, push, and SMS notifications"
        />
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-4 p-4 text-left hover:bg-red-50 text-red-600"
        >
          <div className="p-2 rounded-lg bg-red-50">
            <LogOut size={20} />
          </div>
          <div>
            <p className="font-medium">Sign Out</p>
            <p className="text-sm text-red-500">Log out of your account</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function SettingsLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="p-2 rounded-lg bg-gray-100 text-gray-600">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
