'use client';

import { useState } from 'react';
import { useSubmitAssessment } from '@/hooks/use-enrollments';
import type { Assessment, AssessmentResult, AssessmentQuestion } from '@/lib/api/enrollments';

interface QuizPlayerProps {
  assessment: Assessment;
  enrollmentId: string;
}

function getOptions(question: AssessmentQuestion): string[] {
  if (question.type === 'true_false') {
    return question.options && question.options.length > 0
      ? question.options
      : ['True', 'False'];
  }
  return question.options || [];
}

export function QuizPlayer({ assessment, enrollmentId }: QuizPlayerProps) {
  const submitAssessment = useSubmitAssessment();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const res = await submitAssessment.mutateAsync({
      assessmentId: assessment.id,
      data: { enrollmentId, answers },
    });
    setResult(res);
  };

  if (result) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Results</h2>
            <p className="text-sm text-muted-foreground">
              Score: {result.score}/{result.totalPoints} ({Math.round(result.percentage)}%)
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              result.passed
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {result.passed ? 'Passed' : 'Not Passed'}
          </div>
        </div>

        <div className="space-y-3">
          {result.results.map((r) => (
            <div key={r.questionId} className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium mb-2">{r.questionText}</p>
              <p className="text-sm text-muted-foreground">
                Your answer: <span className="text-foreground">{r.userAnswer || '—'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {r.correct ? 'Correct' : 'Incorrect'} • {r.earnedPoints}/{r.points} points
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {assessment.questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {idx + 1}. {q.text}
            </h3>
            <span className="text-xs text-muted-foreground">{q.points} pts</span>
          </div>

          {q.type === 'multiple_choice' || q.type === 'true_false' ? (
            <div className="space-y-2">
              {getOptions(q).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 cursor-pointer hover:bg-muted/30"
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSelect(q.id, opt)}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleSelect(q.id, e.target.value)}
                rows={q.type === 'essay' ? 5 : 3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Type your answer..."
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitAssessment.isPending}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          {submitAssessment.isPending ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </div>
    </div>
  );
}
