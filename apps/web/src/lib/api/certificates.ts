import { api } from './client';
import type { PaginatedResponse } from './programs';

export interface Certificate {
  id: string;
  userId: string;
  programId: string;
  enrollmentId: string;
  certificateNumber: string;
  verificationCode: string;
  recipientName: string;
  programTitle: string;
  completionDate: string | null;
  issuedAt: string;
  issuedBy: string | null;
  downloadUrl: string | null;
  isRevoked: boolean;
  revokedAt: string | null;
  revokedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export const certificatesApi = {
  getMyCertificates: (page = 1, limit = 10) =>
    api.getRaw<PaginatedResponse<Certificate>>('/certificates/me', {
      params: { page, limit },
    }),

  getById: (id: string) =>
    api.get<Certificate>(`/certificates/${id}`),

  getByEnrollment: (enrollmentId: string) =>
    api.get<Certificate>(`/certificates/enrollment/${enrollmentId}`),

  verify: (verificationCode: string) =>
    api.get<{ valid: boolean; certificate: Certificate }>(
      `/certificates/verify/${verificationCode}`,
    ),

  generate: (enrollmentId: string) =>
    api.post<Certificate>('/certificates/generate', { enrollmentId }),

  revoke: (id: string, reason?: string) =>
    api.patch<Certificate>(`/certificates/${id}/revoke`, { reason }),
};
