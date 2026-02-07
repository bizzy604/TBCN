'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AssessmentQuestion } from '@/lib/api/admin-api';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
] as const;

interface QuestionBuilderProps {
  questions: AssessmentQuestion[];
  onChange: (questions: AssessmentQuestion[]) => void;
}

export function QuestionBuilder({ questions, onChange }: QuestionBuilderProps) {
  const addQuestion = () => {
    onChange([
      ...questions,
      {
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10,
        sortOrder: questions.length,
      },
    ]);
  };

  const updateQuestion = (idx: number, patch: Partial<AssessmentQuestion>) => {
    const updated = questions.map((q, i) => (i === idx ? { ...q, ...patch } : q));
    onChange(updated);
  };

  const removeQuestion = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, sortOrder: i })));
  };

  const moveQuestion = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= questions.length) return;
    const updated = [...questions];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    onChange(updated.map((q, i) => ({ ...q, sortOrder: i })));
  };

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => (
        <QuestionCard
          key={idx}
          index={idx}
          question={q}
          total={questions.length}
          onUpdate={(patch) => updateQuestion(idx, patch)}
          onRemove={() => removeQuestion(idx)}
          onMove={(dir) => moveQuestion(idx, dir)}
        />
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addQuestion}>
        + Add Question
      </Button>
    </div>
  );
}

function QuestionCard({
  index,
  question,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  index: number;
  question: AssessmentQuestion;
  total: number;
  onUpdate: (patch: Partial<AssessmentQuestion>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const needsOptions = question.type === 'multiple_choice';
  const isTrueFalse = question.type === 'true_false';

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Q{index + 1}: {question.text || '(untitled)'}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition"
            title="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition"
            title="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Remove question"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Question text */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Question Text
            </label>
            <textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Enter your question..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Type
              </label>
              <select
                value={question.type}
                onChange={(e) => {
                  const type = e.target.value as AssessmentQuestion['type'];
                  const patch: Partial<AssessmentQuestion> = { type };
                  if (type === 'true_false') {
                    patch.options = ['True', 'False'];
                    patch.correctAnswer = '';
                  } else if (type === 'multiple_choice') {
                    patch.options = ['', '', '', ''];
                    patch.correctAnswer = '';
                  } else {
                    patch.options = undefined;
                    patch.correctAnswer = type === 'short_answer' ? '' : undefined;
                  }
                  onUpdate(patch);
                }}
                aria-label="Question type"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Points */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Points
              </label>
              <Input
                type="number"
                min={1}
                value={question.points}
                onChange={(e) => onUpdate({ points: Number(e.target.value) || 10 })}
              />
            </div>
          </div>

          {/* Options for multiple choice */}
          {needsOptions && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Options
              </label>
              <div className="space-y-2">
                {(question.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={question.correctAnswer === opt && opt !== ''}
                      onChange={() => onUpdate({ correctAnswer: opt })}
                      className="accent-primary"
                      title="Mark as correct answer"
                    />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])];
                        const oldOpt = newOptions[oi];
                        newOptions[oi] = e.target.value;
                        const patch: Partial<AssessmentQuestion> = { options: newOptions };
                        // If the correct answer was this option, update it
                        if (question.correctAnswer === oldOpt) {
                          patch.correctAnswer = e.target.value;
                        }
                        onUpdate(patch);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      className="flex-1"
                    />
                    {(question.options?.length || 0) > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = (question.options || []).filter((_, i) => i !== oi);
                          onUpdate({ options: newOptions });
                        }}
                        className="text-muted-foreground hover:text-red-500 transition text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {(question.options?.length || 0) < 6 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdate({ options: [...(question.options || []), ''] })}
                  >
                    + Add Option
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select the radio button next to the correct answer.
              </p>
            </div>
          )}

          {/* True/False correct answer */}
          {isTrueFalse && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Correct Answer
              </label>
              <div className="flex gap-4">
                {['True', 'False'].map((val) => (
                  <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name={`tf-${index}`}
                      checked={question.correctAnswer === val}
                      onChange={() => onUpdate({ correctAnswer: val })}
                      className="accent-primary"
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Short answer correct answer */}
          {question.type === 'short_answer' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Expected Answer (for reference — graded manually)
              </label>
              <Input
                value={question.correctAnswer || ''}
                onChange={(e) => onUpdate({ correctAnswer: e.target.value })}
                placeholder="Expected answer..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
