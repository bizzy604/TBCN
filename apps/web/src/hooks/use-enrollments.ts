'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { programKeys } from './use-programs';

export const enrollmentKeys = {
  all: ['enrollments'] as const,
  mine: (page?: number) => ['enrollments', 'mine', page] as const,
  detail: (id: string) => ['enrollments', id] as const,
  progress: (id: string) => ['enrollments', id, 'progress'] as const,
  assessment: (id: string) => ['assessments', id] as const,
  assessmentByLesson: (lessonId: string) => ['assessments', 'lesson', lessonId] as const,
};

export function useMyEnrollments(page = 1, limit = 10) {
  return useQuery({
    queryKey: enrollmentKeys.mine(page),
    queryFn: () => enrollmentsApi.getMyEnrollments(page, limit),
  });
}

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (programId: string) => enrollmentsApi.enroll(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      queryClient.invalidateQueries({ queryKey: programKeys.all });
    },
  });
}

export function useDropEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => enrollmentsApi.drop(enrollmentId),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });
}

export function useLessonProgress(enrollmentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.progress(enrollmentId),
    queryFn: () => enrollmentsApi.getProgress(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: string;
      data: { lessonId: string; completed?: boolean; timeSpent?: number; lastPosition?: number };
    }) => enrollmentsApi.updateProgress(enrollmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.progress(variables.enrollmentId),
      });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.detail(variables.enrollmentId),
      });
    },
  });
}

export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.assessment(assessmentId),
    queryFn: () => enrollmentsApi.getAssessment(assessmentId),
    enabled: !!assessmentId,
  });
}

export function useAssessmentByLesson(lessonId: string) {
  return useQuery({
    queryKey: enrollmentKeys.assessmentByLesson(lessonId),
    queryFn: () => enrollmentsApi.getAssessmentByLesson(lessonId),
    enabled: !!lessonId,
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: { enrollmentId: string; answers: Record<string, string> };
    }) => enrollmentsApi.submitAssessment(assessmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.assessment(variables.assessmentId),
      });
    },
  });
}
