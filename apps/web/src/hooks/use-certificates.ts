'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api/certificates';

export const certificateKeys = {
  all: ['certificates'] as const,
  mine: (page: number, limit: number) =>
    ['certificates', 'mine', page, limit] as const,
  detail: (id: string) => ['certificates', 'detail', id] as const,
  enrollment: (enrollmentId: string) =>
    ['certificates', 'enrollment', enrollmentId] as const,
  verification: (verificationCode: string) =>
    ['certificates', 'verification', verificationCode] as const,
};

export function useMyCertificates(page = 1, limit = 10) {
  return useQuery({
    queryKey: certificateKeys.mine(page, limit),
    queryFn: () => certificatesApi.getMyCertificates(page, limit),
  });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => certificatesApi.getById(id),
    enabled: !!id,
  });
}

export function useCertificateByEnrollment(enrollmentId: string) {
  return useQuery({
    queryKey: certificateKeys.enrollment(enrollmentId),
    queryFn: () => certificatesApi.getByEnrollment(enrollmentId),
    enabled: !!enrollmentId,
  });
}

export function useVerifyCertificate(verificationCode: string) {
  return useQuery({
    queryKey: certificateKeys.verification(verificationCode),
    queryFn: () => certificatesApi.verify(verificationCode),
    enabled: !!verificationCode,
  });
}

export function useGenerateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => certificatesApi.generate(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}
