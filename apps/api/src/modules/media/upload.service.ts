import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../../integrations/aws/s3.service';
import { MediaService } from './media.service';
import { MediaType } from './entities/media-asset.entity';

const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const DOC_TYPES = ['application/pdf'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

@Injectable()
export class UploadService {
  constructor(
    private readonly s3: S3Service,
    private readonly mediaService: MediaService,
  ) {}

  private assertAllowed(contentType: string, mediaType: MediaType) {
    const allowed = {
      [MediaType.VIDEO]: VIDEO_TYPES,
      [MediaType.IMAGE]: IMAGE_TYPES,
      [MediaType.DOCUMENT]: DOC_TYPES,
      [MediaType.AUDIO]: AUDIO_TYPES,
    }[mediaType];

    if (!allowed || !allowed.includes(contentType)) {
      throw new BadRequestException('Unsupported file type');
    }
  }

  async createPresignedUpload(
    uploaderId: string,
    fileName: string,
    contentType: string,
    mediaType: MediaType,
    fileSize?: number,
  ) {
    this.assertAllowed(contentType, mediaType);

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${uploaderId}/${uuidv4()}-${sanitizedName}`;

    const { uploadUrl } = await this.s3.getPresignedUploadUrl(
      key,
      contentType,
      3600,
    );

    await this.mediaService.createPending(
      uploaderId,
      fileName,
      contentType,
      mediaType,
      key,
      fileSize,
    );

    return { uploadUrl, key };
  }

  async confirmUpload(
    uploaderId: string,
    key: string,
    fileSize?: number,
    metadata?: Record<string, unknown>,
  ) {
    const exists = await this.s3.exists(key);
    if (!exists) {
      throw new BadRequestException('File not found in storage');
    }

    const url = this.s3.getObjectUrl(key);
    return this.mediaService.markUploaded(uploaderId, key, url, fileSize, metadata);
  }

  async deleteUpload(uploaderId: string, key: string) {
    await this.s3.delete(key);
    await this.mediaService.remove(uploaderId, key);
  }
}
