'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useProgramById } from '@/hooks/use-programs';
import { mediaApi } from '@/lib/api/media';
import { programsApi, type Lesson, type ProgramModule } from '@/lib/api/programs';

type UploadMap = Record<string, boolean>;

function sortModules(modules?: ProgramModule[]) {
  return [...(modules || [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((mod) => ({
      ...mod,
      lessons: [...(mod.lessons || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    }));
}

export default function ProgramBuilderPage() {
  const params = useParams<{ id: string }>();
  const programId = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id || ''),
    [params],
  );
  const queryClient = useQueryClient();
  const { data: program, isLoading } = useProgramById(programId);

  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [status, setStatus] = useState('draft');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('KES');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [saving, setSaving] = useState(false);
  const [busyModuleId, setBusyModuleId] = useState<string | null>(null);
  const [busyLessonId, setBusyLessonId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadMap>({});

  useEffect(() => {
    if (!program || initialized) return;
    setTitle(program.title);
    setDescription(program.description || '');
    setDifficulty(program.difficulty);
    setStatus(program.status);
    setIsFree(!!program.isFree);
    setPrice(String(program.price ?? 0));
    setCurrency(program.currency || 'KES');
    setThumbnailUrl(program.thumbnailUrl || '');
    setBannerUrl(program.bannerUrl || '');
    setModules(sortModules(program.modules));
    setInitialized(true);
  }, [program, initialized]);

  const invalidateProgramQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['programs', programId] }),
      queryClient.invalidateQueries({ queryKey: ['programs'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs', 'all'] }),
    ]);
  };

  const updateModule = (moduleId: string, patch: Partial<ProgramModule>) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)));
  };

  const updateLesson = (moduleId: string, lessonId: string, patch: Partial<Lesson>) => {
    setModules((prev) =>
      prev.map((module) => {
        if (module.id !== moduleId) return module;
        return {
          ...module,
          lessons: (module.lessons || []).map((lesson) =>
            lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
          ),
        };
      }),
    );
  };

  const saveProgram = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!programId) return;
    try {
      setSaving(true);
      await programsApi.update(programId, {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        status,
        isFree,
        price: isFree ? 0 : Number(price || 0),
        currency: currency.trim().toUpperCase(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
      });
      await invalidateProgramQueries();
      toast.success('Program updated');
    } catch {
      toast.error('Failed to save program');
    } finally {
      setSaving(false);
    }
  };

  const setProgramStatus = async (nextStatus: 'published' | 'archived') => {
    if (!programId) return;
    try {
      setSaving(true);
      if (nextStatus === 'published') {
        await programsApi.publish(programId);
      } else {
        await programsApi.archive(programId);
      }
      setStatus(nextStatus);
      await invalidateProgramQueries();
      toast.success(nextStatus === 'published' ? 'Program published' : 'Program archived');
    } catch {
      toast.error('Unable to update program status');
    } finally {
      setSaving(false);
    }
  };

  const uploadProgramImage = async (
    event: ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'banner',
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      const url = await mediaApi.uploadFile(file, 'image');
      if (type === 'thumbnail') setThumbnailUrl(url);
      if (type === 'banner') setBannerUrl(url);
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
      event.target.value = '';
    }
  };

  const addModule = async () => {
    if (!programId) return;
    try {
      const created = await programsApi.createModule(programId, {
        title: `Module ${modules.length + 1}`,
        sortOrder: modules.length,
      });
      setModules((prev) => sortModules([...prev, { ...created, lessons: [], lessonCount: 0 }]));
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to add module');
    }
  };

  const saveModule = async (module: ProgramModule) => {
    try {
      setBusyModuleId(module.id);
      await programsApi.updateModule(module.id, {
        title: module.title,
        description: module.description || undefined,
        sortOrder: Number(module.sortOrder || 0),
      });
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to save module');
    } finally {
      setBusyModuleId(null);
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and its lessons?')) return;
    try {
      setBusyModuleId(moduleId);
      await programsApi.deleteModule(moduleId);
      setModules((prev) => prev.filter((module) => module.id !== moduleId));
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to delete module');
    } finally {
      setBusyModuleId(null);
    }
  };

  const addLesson = async (moduleId: string) => {
    const module = modules.find((item) => item.id === moduleId);
    const sortOrder = module?.lessons?.length || 0;
    try {
      setBusyModuleId(moduleId);
      const lesson = await programsApi.createLesson(moduleId, {
        title: `Lesson ${sortOrder + 1}`,
        contentType: 'text',
        sortOrder,
      });
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
                ...m,
                lessons: [...(m.lessons || []), lesson].sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : m,
        ),
      );
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to add lesson');
    } finally {
      setBusyModuleId(null);
    }
  };

  const saveLesson = async (lesson: Lesson) => {
    try {
      setBusyLessonId(lesson.id);
      await programsApi.updateLesson(lesson.id, {
        title: lesson.title,
        contentType: lesson.contentType,
        content: lesson.content || undefined,
        videoUrl: lesson.videoUrl || undefined,
        sortOrder: Number(lesson.sortOrder || 0),
        isFree: lesson.isFree,
      });
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to save lesson');
    } finally {
      setBusyLessonId(null);
    }
  };

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      setBusyLessonId(lessonId);
      await programsApi.deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((module) =>
          module.id === moduleId
            ? { ...module, lessons: (module.lessons || []).filter((lesson) => lesson.id !== lessonId) }
            : module,
        ),
      );
      await invalidateProgramQueries();
    } catch {
      toast.error('Failed to delete lesson');
    } finally {
      setBusyLessonId(null);
    }
  };

  const uploadLessonVideo = async (
    event: ChangeEvent<HTMLInputElement>,
    moduleId: string,
    lessonId: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading((prev) => ({ ...prev, [lessonId]: true }));
      const url = await mediaApi.uploadFile(file, 'video');
      updateLesson(moduleId, lessonId, { videoUrl: url });
      toast.success('Video uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Video upload failed');
    } finally {
      setUploading((prev) => ({ ...prev, [lessonId]: false }));
      event.target.value = '';
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading program...</p>;
  if (!program) return <p className="text-sm text-muted-foreground">Program not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Program Builder</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/programs" className="rounded-lg border border-border px-3 py-2 text-sm">Back</Link>
          <button onClick={() => setProgramStatus('published')} className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white">Publish</button>
          <button onClick={() => setProgramStatus('archived')} className="rounded-lg bg-amber-600 px-3 py-2 text-sm text-white">Archive</button>
        </div>
      </div>

      <form onSubmit={saveProgram} className="rounded-xl border border-border bg-card p-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Program title" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Program description" className="min-h-[120px] w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <div className="grid gap-3 md:grid-cols-4">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm">
            <option value="beginner">beginner</option><option value="intermediate">intermediate</option><option value="advanced">advanced</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border px-3 py-2 text-sm">
            <option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option>
          </select>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency" className="rounded-lg border border-border px-3 py-2 text-sm" />
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} disabled={isFree} className="rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />Free program</label>
        <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Thumbnail URL" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="Banner URL" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        <div className="grid gap-3 md:grid-cols-2">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadProgramImage(e, 'thumbnail')} className="text-xs" />
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadProgramImage(e, 'banner')} className="text-xs" />
        </div>
        <button type="submit" disabled={saving || uploading.thumbnail || uploading.banner} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{saving ? 'Saving...' : 'Save Program'}</button>
      </form>

      <section className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Modules & Lessons</h2>
          <button onClick={addModule} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Add Module</button>
        </div>
        {modules.map((module) => (
          <div key={module.id} className="rounded-lg border border-border p-3 space-y-3">
            <div className="grid gap-2 md:grid-cols-3">
              <input value={module.title} onChange={(e) => updateModule(module.id, { title: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm" />
              <input type="number" min={0} value={module.sortOrder} onChange={(e) => updateModule(module.id, { sortOrder: Number(e.target.value || 0) })} className="rounded-lg border border-border px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={() => saveModule(module)} disabled={busyModuleId === module.id} className="rounded-lg border border-border px-3 py-2 text-sm">Save</button>
                <button onClick={() => addLesson(module.id)} disabled={busyModuleId === module.id} className="rounded-lg border border-border px-3 py-2 text-sm">Add Lesson</button>
                <button onClick={() => deleteModule(module.id)} disabled={busyModuleId === module.id} className="rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground">Delete</button>
              </div>
            </div>
            {(module.lessons || []).map((lesson) => (
              <div key={lesson.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="grid gap-2 md:grid-cols-4">
                  <input value={lesson.title} onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm md:col-span-2" />
                  <select value={lesson.contentType} onChange={(e) => updateLesson(module.id, lesson.id, { contentType: e.target.value })} className="rounded-lg border border-border px-3 py-2 text-sm"><option value="text">text</option><option value="video">video</option><option value="audio">audio</option><option value="pdf">pdf</option><option value="assignment">assignment</option></select>
                  <input type="number" min={0} value={lesson.sortOrder} onChange={(e) => updateLesson(module.id, lesson.id, { sortOrder: Number(e.target.value || 0) })} className="rounded-lg border border-border px-3 py-2 text-sm" />
                </div>
                <textarea value={lesson.content || ''} onChange={(e) => updateLesson(module.id, lesson.id, { content: e.target.value })} placeholder="Lesson content" className="min-h-[80px] w-full rounded-lg border border-border px-3 py-2 text-sm" />
                <input value={lesson.videoUrl || ''} onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })} placeholder="Lesson video URL" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                <div className="flex items-center gap-3">
                  <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => uploadLessonVideo(e, module.id, lesson.id)} className="text-xs" />
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={lesson.isFree} onChange={(e) => updateLesson(module.id, lesson.id, { isFree: e.target.checked })} />Free preview</label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveLesson(lesson)} disabled={busyLessonId === lesson.id || uploading[lesson.id]} className="rounded-lg border border-border px-3 py-2 text-sm">Save Lesson</button>
                  <button onClick={() => deleteLesson(module.id, lesson.id)} disabled={busyLessonId === lesson.id} className="rounded-lg bg-destructive px-3 py-2 text-sm text-destructive-foreground">Delete Lesson</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

