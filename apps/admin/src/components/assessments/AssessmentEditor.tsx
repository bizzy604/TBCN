'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuestionBuilder } from './QuestionBuilder';
import {
  adminAssessmentsApi,
  type Assessment,
  type AssessmentQuestion,
  type CreateAssessmentPayload,
} from '@/lib/api/admin-api';
import toast from 'react-hot-toast';

const ASSESSMENT_TYPES = [
  { value: 'quiz', label: 'Quiz (auto-graded)' },
  { value: 'assignment', label: 'Assignment (manual grading)' },
  { value: 'peer_review', label: 'Peer Review' },
  { value: 'capstone', label: 'Capstone Project' },
] as const;

interface AssessmentEditorProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export function AssessmentEditor({ lessonId, lessonTitle, onClose }: AssessmentEditorProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Assessment['type']>('quiz');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>('');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

  // Load existing assessment for this lesson
  useEffect(() => {
    setLoading(true);
    adminAssessmentsApi
      .getByLesson(lessonId)
      .then((data) => {
        if (data) {
          // Existing assessment — load full version with answers
          return adminAssessmentsApi.getFull(data.id).then((full) => {
            setAssessment(full);
            setTitle(full.title);
            setDescription(full.description || '');
            setType(full.type);
            setPassingScore(full.passingScore);
            setMaxAttempts(full.maxAttempts);
            setTimeLimitMinutes(full.timeLimitMinutes || '');
            setQuestions(full.questions);
          });
        } else {
          // No assessment yet — prefill title
          setTitle(`${lessonTitle} Assessment`);
        }
      })
      .catch(() => {
        // 404 means no assessment yet
        setTitle(`${lessonTitle} Assessment`);
      })
      .finally(() => setLoading(false));
  }, [lessonId, lessonTitle]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Assessment title is required');
      return;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} needs text`);
        return;
      }
      if (q.type === 'multiple_choice') {
        const filledOptions = (q.options || []).filter((o) => o.trim());
        if (filledOptions.length < 2) {
          toast.error(`Question ${i + 1} needs at least 2 options`);
          return;
        }
        if (!q.correctAnswer?.trim()) {
          toast.error(`Question ${i + 1} needs a correct answer selected`);
          return;
        }
      }
      if (q.type === 'true_false' && !q.correctAnswer) {
        toast.error(`Question ${i + 1} needs a correct answer (True/False)`);
        return;
      }
    }

    setSaving(true);
    try {
      if (assessment) {
        // Update
        await adminAssessmentsApi.update(assessment.id, {
          title,
          description: description || undefined,
          type,
          passingScore,
          maxAttempts,
          timeLimitMinutes: timeLimitMinutes || null,
          questions,
        });
        toast.success('Assessment updated');
      } else {
        // Create
        const payload: CreateAssessmentPayload = {
          lessonId,
          title,
          description: description || undefined,
          type,
          passingScore,
          maxAttempts,
          timeLimitMinutes: timeLimitMinutes || null,
          questions: questions.map(({ id, ...rest }) => rest),
        };
        const created = await adminAssessmentsApi.create(payload);
        setAssessment(created);
        toast.success('Assessment created');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  }, [assessment, lessonId, title, description, type, passingScore, maxAttempts, timeLimitMinutes, questions]);

  const handleDelete = useCallback(async () => {
    if (!assessment) return;
    if (!confirm('Delete this assessment and all its questions? This cannot be undone.')) return;
    setSaving(true);
    try {
      await adminAssessmentsApi.delete(assessment.id);
      toast.success('Assessment deleted');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  }, [assessment, onClose]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground mb-1">
          {assessment ? 'Edit Assessment' : 'Create Assessment'} for:
        </p>
        <p className="text-sm font-medium text-foreground">{lessonTitle}</p>
      </div>

      {/* Assessment settings */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assessment title" />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="Brief description of this assessment..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Assessment['type'])}
              aria-label="Assessment type"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Passing Score (%)</label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Attempts</label>
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Time Limit (min, optional)
            </label>
            <Input
              type="number"
              min={1}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : '')}
              placeholder="No limit"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Questions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Questions ({questions.length})
          {questions.length > 0 && (
            <span className="font-normal text-muted-foreground ml-2">
              Total: {questions.reduce((s, q) => s + q.points, 0)} pts
            </span>
          )}
        </h3>
        <QuestionBuilder questions={questions} onChange={setQuestions} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {assessment ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={saving}
          >
            Delete Assessment
          </Button>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : assessment ? 'Update Assessment' : 'Create Assessment'}
          </Button>
        </div>
      </div>
    </div>
  );
}
