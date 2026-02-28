import { api } from './client';

export type MediaType = 'video' | 'image' | 'document' | 'audio';

interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
}

interface ConfirmUploadResponse {
  id: string;
  url: string | null;
  s3Key: string;
}

async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage');
  }
}

export const mediaApi = {
  requestUploadUrl: (file: File, mediaType: MediaType) =>
    api.post<PresignedUploadResponse>('/media/upload-url', {
      fileName: file.name,
      contentType: file.type,
      mediaType,
      fileSize: file.size,
    }),

  confirmUpload: (key: string, fileSize?: number, metadata?: Record<string, unknown>) =>
    api.post<ConfirmUploadResponse>('/media/confirm', {
      s3Key: key,
      fileSize,
      metadata,
    }),

  async uploadFile(file: File, mediaType: MediaType): Promise<string> {
    const { uploadUrl, key } = await this.requestUploadUrl(file, mediaType);
    await uploadToPresignedUrl(uploadUrl, file);
    const confirmed = await this.confirmUpload(key, file.size);
    if (!confirmed.url) {
      throw new Error('Upload confirmed but no file URL was returned');
    }
    return confirmed.url;
  },
};

