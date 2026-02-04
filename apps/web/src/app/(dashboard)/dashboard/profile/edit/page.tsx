'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { usersApi } from '@/lib/api';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().max(1000, 'Bio must not exceed 1000 characters').optional(),
  headline: z.string().max(255, 'Headline must not exceed 255 characters').optional(),
  company: z.string().max(255).optional(),
  jobTitle: z.string().max(255).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      timezone: user?.timezone || 'UTC',
      bio: '',
      headline: '',
      company: '',
      jobTitle: '',
      location: '',
      website: '',
      linkedinUrl: '',
      twitterUrl: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      // Update user data
      await usersApi.updateMe({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        timezone: data.timezone,
      });

      // Update profile data
      await usersApi.updateMyProfile({
        bio: data.bio,
        headline: data.headline,
        company: data.company,
        jobTitle: data.jobTitle,
        location: data.location,
        website: data.website || undefined,
        linkedinUrl: data.linkedinUrl || undefined,
        twitterUrl: data.twitterUrl || undefined,
      });

      await refetchUser();
      toast.success('Profile updated successfully');
      router.push('/dashboard/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await usersApi.uploadAvatar(file);
      await refetchUser();
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/profile"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500">Update your personal and professional information</p>
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera size={32} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors"
            >
              {isUploadingAvatar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">Profile Photo</p>
            <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="input"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select className="input" {...register('timezone')}>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              rows={4}
              className="input"
              placeholder="Tell us about yourself..."
              {...register('bio')}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Professional Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Headline
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Executive Coach | Leadership Trainer"
              {...register('headline')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                className="input"
                {...register('company')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                className="input"
                {...register('jobTitle')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              className="input"
              placeholder="City, Country"
              {...register('location')}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Social Links</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              className={`input ${errors.website ? 'border-red-500' : ''}`}
              placeholder="https://yourwebsite.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn
            </label>
            <input
              type="url"
              className={`input ${errors.linkedinUrl ? 'border-red-500' : ''}`}
              placeholder="https://linkedin.com/in/yourprofile"
              {...register('linkedinUrl')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Twitter / X
            </label>
            <input
              type="url"
              className={`input ${errors.twitterUrl ? 'border-red-500' : ''}`}
              placeholder="https://twitter.com/yourhandle"
              {...register('twitterUrl')}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/profile"
            className="btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
