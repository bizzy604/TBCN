'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminProgramsApi, type Program } from '@/lib/api/admin-api';

interface ProgramFormProps {
  program?: Program;
  mode: 'create' | 'edit';
}

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const CONTENT_TYPE_OPTIONS = ['video', 'text', 'quiz', 'assignment', 'resource'];

interface ModuleForm {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  estimatedDuration: number;
  lessons: LessonForm[];
}

interface LessonForm {
  id?: string;
  title: string;
  description: string;
  contentType: string;
  content: string;
  videoUrl: string;
  sortOrder: number;
  isFree: boolean;
  estimatedDuration: number;
}

function emptyLesson(sortOrder: number): LessonForm {
  return {
    title: '',
    description: '',
    contentType: 'video',
    content: '',
    videoUrl: '',
    sortOrder,
    isFree: false,
    estimatedDuration: 0,
  };
}

function emptyModule(sortOrder: number): ModuleForm {
  return {
    title: '',
    description: '',
    sortOrder,
    estimatedDuration: 0,
    lessons: [emptyLesson(0)],
  };
}

export function ProgramForm({ program, mode }: ProgramFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic fields
  const [title, setTitle] = useState(program?.title || '');
  const [description, setDescription] = useState(program?.description || '');
  const [shortDescription, setShortDescription] = useState(program?.shortDescription || '');
  const [difficulty, setDifficulty] = useState(program?.difficulty || 'beginner');
  const [price, setPrice] = useState(program?.price?.toString() || '0');
  const [isFree, setIsFree] = useState(program?.isFree ?? true);
  const [thumbnailUrl, setThumbnailUrl] = useState(program?.thumbnailUrl || '');
  const [tags, setTags] = useState(program?.tags?.join(', ') || '');
  const [prerequisites, setPrerequisites] = useState(program?.prerequisites?.join('\n') || '');
  const [learningOutcomes, setLearningOutcomes] = useState(
    program?.learningOutcomes?.join('\n') || '',
  );
  const [maxEnrollments, setMaxEnrollments] = useState(
    program?.maxEnrollments?.toString() || '',
  );

  // Modules
  const [modules, setModules] = useState<ModuleForm[]>(() => {
    if (program?.modules?.length) {
      return program.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        description: mod.description || '',
        sortOrder: mod.sortOrder,
        estimatedDuration: mod.estimatedDuration || 0,
        lessons: mod.lessons?.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description || '',
          contentType: l.contentType,
          content: '',
          videoUrl: l.videoUrl || '',
          sortOrder: l.sortOrder,
          isFree: l.isFree,
          estimatedDuration: l.estimatedDuration || 0,
        })) || [emptyLesson(0)],
      }));
    }
    return [emptyModule(0)];
  });

  const addModule = useCallback(() => {
    setModules((prev) => [...prev, emptyModule(prev.length)]);
  }, []);

  const removeModule = useCallback((idx: number) => {
    setModules((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateModule = useCallback(
    (idx: number, field: keyof ModuleForm, value: string | number) => {
      setModules((prev) => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], [field]: value };
        return copy;
      });
    },
    [],
  );

  const addLesson = useCallback((moduleIdx: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[moduleIdx] = {
        ...copy[moduleIdx],
        lessons: [...copy[moduleIdx].lessons, emptyLesson(copy[moduleIdx].lessons.length)],
      };
      return copy;
    });
  }, []);

  const removeLesson = useCallback((moduleIdx: number, lessonIdx: number) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[moduleIdx] = {
        ...copy[moduleIdx],
        lessons: copy[moduleIdx].lessons.filter((_, i) => i !== lessonIdx),
      };
      return copy;
    });
  }, []);

  const updateLesson = useCallback(
    (moduleIdx: number, lessonIdx: number, field: keyof LessonForm, value: string | number | boolean) => {
      setModules((prev) => {
        const copy = [...prev];
        const lessons = [...copy[moduleIdx].lessons];
        lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: value };
        copy[moduleIdx] = { ...copy[moduleIdx], lessons };
        return copy;
      });
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title,
        description,
        shortDescription: shortDescription || undefined,
        difficulty,
        price: isFree ? 0 : parseFloat(price),
        isFree,
        thumbnailUrl: thumbnailUrl || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        prerequisites: prerequisites.split('\n').filter(Boolean),
        learningOutcomes: learningOutcomes.split('\n').filter(Boolean),
        maxEnrollments: maxEnrollments ? parseInt(maxEnrollments) : undefined,
        modules: modules.map((mod, mi) => ({
          title: mod.title,
          description: mod.description || undefined,
          sortOrder: mi,
          estimatedDuration: mod.estimatedDuration || undefined,
          lessons: mod.lessons.map((l, li) => ({
            title: l.title,
            description: l.description || undefined,
            contentType: l.contentType,
            content: l.content || undefined,
            videoUrl: l.videoUrl || undefined,
            sortOrder: li,
            isFree: l.isFree,
            estimatedDuration: l.estimatedDuration || undefined,
          })),
        })),
      };

      if (mode === 'create') {
        const created = await adminProgramsApi.create(payload as Partial<Program>);
        router.push(`/programs/${created.id}`);
      } else if (program) {
        await adminProgramsApi.update(program.id, payload as Partial<Program>);
        router.push(`/programs/${program.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Short Description</label>
          <Input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief summary shown in cards"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Free?
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded"
              />
            </label>
            {!isFree && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (USD)"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Enrollments</label>
            <Input
              type="number"
              min="0"
              value={maxEnrollments}
              onChange={(e) => setMaxEnrollments(e.target.value)}
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Thumbnail URL</label>
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma-separated)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="branding, coaching, leadership"
          />
        </div>
      </section>

      {/* Learning Outcomes & Prerequisites */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Learning Outcomes & Prerequisites</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Learning Outcomes (one per line)</label>
          <textarea
            value={learningOutcomes}
            onChange={(e) => setLearningOutcomes(e.target.value)}
            rows={4}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Master the fundamentals of brand building&#10;Develop a personal brand strategy"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Prerequisites (one per line)</label>
          <textarea
            value={prerequisites}
            onChange={(e) => setPrerequisites(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Basic understanding of marketing&#10;Access to a computer"
          />
        </div>
      </section>

      {/* Curriculum Builder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Curriculum</h2>
          <Button type="button" variant="outline" size="sm" onClick={addModule}>
            + Add Module
          </Button>
        </div>

        {modules.map((mod, mi) => (
          <div key={mi} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-medium">Module {mi + 1}</h3>
              {modules.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeModule(mi)}
                  className="text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Module Title *</label>
                  <Input
                    value={mod.title}
                    onChange={(e) => updateModule(mi, 'title', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Est. Duration (min)</label>
                  <Input
                    type="number"
                    min="0"
                    value={mod.estimatedDuration || ''}
                    onChange={(e) =>
                      updateModule(mi, 'estimatedDuration', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={mod.description}
                  onChange={(e) => updateModule(mi, 'description', e.target.value)}
                />
              </div>

              {/* Lessons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Lessons ({mod.lessons.length})
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addLesson(mi)}
                  >
                    + Add Lesson
                  </Button>
                </div>

                {mod.lessons.map((lesson, li) => (
                  <div
                    key={li}
                    className="rounded-lg border border-border/60 p-4 space-y-3 bg-background"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Lesson {li + 1}
                      </span>
                      {mod.lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLesson(mi, li)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium">Title *</label>
                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Type</label>
                        <select
                          value={lesson.contentType}
                          onChange={(e) =>
                            updateLesson(mi, li, 'contentType', e.target.value)
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {CONTENT_TYPE_OPTIONS.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct.charAt(0).toUpperCase() + ct.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {lesson.contentType === 'video' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Video URL</label>
                        <Input
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(mi, li, 'videoUrl', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={lesson.isFree}
                          onChange={(e) =>
                            updateLesson(mi, li, 'isFree', e.target.checked)
                          }
                          className="rounded"
                        />
                        Free preview
                      </label>
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium">Duration (min)</label>
                        <Input
                          type="number"
                          min="0"
                          className="w-20 h-7 text-xs"
                          value={lesson.estimatedDuration || ''}
                          onChange={(e) =>
                            updateLesson(
                              mi,
                              li,
                              'estimatedDuration',
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Program'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}