'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCreateProgram } from '@/hooks/use-programs';
import { mediaApi } from '@/lib/api/media';

type UploadField = 'thumbnailUrl' | 'bannerUrl';

interface FormState {
  title: string;
  description: string;
  shortDescription: string;
  difficulty: string;
  price: string;
  currency: string;
  isFree: boolean;
  estimatedDuration: string;
  tags: string;
  prerequisites: string;
  learningOutcomes: string;
  thumbnailUrl: string;
  bannerUrl: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  description: '',
  shortDescription: '',
  difficulty: 'beginner',
  price: '0',
  currency: 'KES',
  isFree: true,
  estimatedDuration: '',
  tags: '',
  prerequisites: '',
  learningOutcomes: '',
  thumbnailUrl: '',
  bannerUrl: '',
};

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function NewProgramPage() {
  const router = useRouter();
  const createProgram = useCreateProgram();

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [uploading, setUploading] = useState<Record<UploadField, boolean>>({
    thumbnailUrl: false,
    bannerUrl: false,
  });

  const isSubmitting = createProgram.isPending;

  const handleInput =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement;
      setForm((prev) => ({
        ...prev,
        [field]: target.type === 'checkbox' ? target.checked : target.value,
      }));
    };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>, field: UploadField) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));
      const url = await mediaApi.uploadFile(file, 'image');
      setForm((prev) => ({ ...prev, [field]: url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
      event.target.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    if (form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      const created = await createProgram.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        difficulty: form.difficulty,
        price: form.isFree ? 0 : Number(form.price || 0),
        currency: form.currency.trim().toUpperCase() || 'KES',
        isFree: form.isFree,
        estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
        tags: splitList(form.tags),
        prerequisites: splitList(form.prerequisites),
        learningOutcomes: splitList(form.learningOutcomes),
        thumbnailUrl: form.thumbnailUrl.trim() || undefined,
        bannerUrl: form.bannerUrl.trim() || undefined,
      });

      toast.success('Program created');
      router.push(`/admin/programs/${created.id}/builder`);
    } catch (error) {
      toast.error(
        error && typeof error === 'object' && 'error' in error
          ? String((error as { error?: { message?: string } }).error?.message || 'Failed to create program')
          : 'Failed to create program',
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create Program</h1>
          <p className="text-muted-foreground">
            Define the program metadata, then build modules and lessons.
          </p>
        </div>
        <Link
          href="/admin/programs"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Back to Programs
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Program Details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Title</span>
              <input
                value={form.title}
                onChange={handleInput('title')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Brand Mastery Blueprint"
                required
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Short Description</span>
              <input
                value={form.shortDescription}
                onChange={handleInput('shortDescription')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="8-week program to build authority and visibility."
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Description</span>
              <textarea
                value={form.description}
                onChange={handleInput('description')}
                className="min-h-[140px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Full overview of outcomes, target learner and curriculum."
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={handleInput('difficulty')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Estimated Duration (minutes)</span>
              <input
                type="number"
                min={0}
                value={form.estimatedDuration}
                onChange={handleInput('estimatedDuration')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="480"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Currency</span>
              <input
                value={form.currency}
                onChange={handleInput('currency')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase"
                placeholder="KES"
                maxLength={3}
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Price</span>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={handleInput('price')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                disabled={form.isFree}
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={handleInput('isFree')}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-foreground">This is a free program</span>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Taxonomy and Outcomes</h2>
          <div className="mt-4 grid gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Tags (comma separated)</span>
              <input
                value={form.tags}
                onChange={handleInput('tags')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="branding, leadership, marketing"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Prerequisites (comma separated)</span>
              <input
                value={form.prerequisites}
                onChange={handleInput('prerequisites')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Laptop access, 3 hours/week"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Learning Outcomes (comma separated)</span>
              <textarea
                value={form.learningOutcomes}
                onChange={handleInput('learningOutcomes')}
                className="min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Define personal brand strategy, Build authority content calendar"
              />
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Media</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images to storage or paste an existing URL.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Thumbnail URL</label>
              <input
                value={form.thumbnailUrl}
                onChange={handleInput('thumbnailUrl')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://..."
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleImageUpload(event, 'thumbnailUrl')}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
              />
              {uploading.thumbnailUrl && <p className="text-xs text-muted-foreground">Uploading thumbnail...</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Banner URL</label>
              <input
                value={form.bannerUrl}
                onChange={handleInput('bannerUrl')}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://..."
              />
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleImageUpload(event, 'bannerUrl')}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium"
              />
              {uploading.bannerUrl && <p className="text-xs text-muted-foreground">Uploading banner...</p>}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/programs"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploading.thumbnailUrl || uploading.bannerUrl}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Program'}
          </button>
        </div>
      </form>
    </div>
  );
}

