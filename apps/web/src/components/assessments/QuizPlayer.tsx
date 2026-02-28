'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSubmitAssessment } from '@/hooks/use-enrollments';
import type { Assessment, AssessmentQuestion, AssessmentResult } from '@/lib/api/enrollments';

interface QuizPlayerProps {
  assessment: Assessment;
  enrollmentId: string;
  existingAttempts?: number;
}

function getOptions(question: AssessmentQuestion): string[] {
  if (question.type === 'true_false') {
    return question.options && question.options.length > 0
      ? question.options
      : ['True', 'False'];
  }
  return question.options || [];
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as { error?: { message?: string } };
    return apiError.error?.message || 'Unable to submit assessment';
  }
  return 'Unable to submit assessment';
}

export function QuizPlayer({
  assessment,
  enrollmentId,
  existingAttempts = 0,
}: QuizPlayerProps) {
  const submitAssessment = useSubmitAssessment();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(existingAttempts);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setAttemptsUsed(existingAttempts);
  }, [existingAttempts]);

  const attemptsRemaining = useMemo(
    () => Math.max(assessment.maxAttempts - attemptsUsed, 0),
    [assessment.maxAttempts, attemptsUsed],
  );
  const maxAttemptsReached = attemptsRemaining <= 0;

  const handleSelect = (questionId: string, value: string) => {
    if (submitError) {
      setSubmitError(null);
    }
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (maxAttemptsReached) {
      setSubmitError('No attempts remaining. Please contact a coach for support.');
      return;
    }

    if (Object.keys(answers).length === 0) {
      setSubmitError('Answer at least one question before submitting.');
      return;
    }

    try {
      setSubmitError(null);
      const res = await submitAssessment.mutateAsync({
        assessmentId: assessment.id,
        data: { enrollmentId, answers },
      });
      setResult(res);
      setAttemptsUsed((prev) => Math.max(prev, res.attemptNumber));
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setSubmitError(null);
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
            <p className="text-xs text-muted-foreground">
              Attempt {result.attemptNumber} of {assessment.maxAttempts}
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

        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
          Attempts remaining: <strong>{result.attemptsRemaining}</strong>
        </div>

        <div className="space-y-3">
          {result.results.map((r) => (
            <div key={r.questionId} className="rounded-lg border border-border/60 p-4">
              <p className="text-sm font-medium mb-2">{r.questionText}</p>
              <p className="text-sm text-muted-foreground">
                Your answer: <span className="text-foreground">{r.userAnswer || '-'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {r.correct ? 'Correct' : 'Incorrect'} - {r.earnedPoints}/{r.points} points
              </p>
            </div>
          ))}
        </div>

        {result.attemptsRemaining > 0 && !result.passed && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRetake}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Retake Assessment
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
        Attempts used: {attemptsUsed}/{assessment.maxAttempts} | Remaining: {attemptsRemaining}
      </div>

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
          disabled={submitAssessment.isPending || maxAttemptsReached}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {submitAssessment.isPending
            ? 'Submitting...'
            : maxAttemptsReached
              ? 'No Attempts Left'
              : 'Submit Assessment'}
        </button>
      </div>

      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
      )}
    </div>
  );
}

