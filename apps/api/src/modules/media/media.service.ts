import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset, MediaStatus, MediaType } from './entities/media-asset.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
  ) {}

  async createPending(
    uploaderId: string,
    fileName: string,
    contentType: string,
    mediaType: MediaType,
    s3Key: string,
    fileSize?: number,
  ): Promise<MediaAsset> {
    const asset = this.mediaRepo.create({
      uploaderId,
      originalName: fileName,
      contentType,
      mediaType,
      s3Key,
      fileSize: fileSize ?? null,
      status: MediaStatus.PENDING,
    });
    return this.mediaRepo.save(asset);
  }

  async markUploaded(
    uploaderId: string,
    s3Key: string,
    url: string,
    fileSize?: number,
    metadata?: Record<string, unknown>,
  ): Promise<MediaAsset> {
    const asset = await this.mediaRepo.findOne({ where: { s3Key, uploaderId } });
    if (!asset) throw new NotFoundException('Media asset not found');

    asset.status = MediaStatus.UPLOADED;
    asset.url = url;
    asset.fileSize = fileSize ?? asset.fileSize;
    asset.metadata = metadata ?? asset.metadata;

    return this.mediaRepo.save(asset);
  }

  async remove(uploaderId: string, s3Key: string): Promise<void> {
    const asset = await this.mediaRepo.findOne({ where: { s3Key, uploaderId } });
    if (!asset) throw new NotFoundException('Media asset not found');

    await this.mediaRepo.remove(asset);
  }

  async findByKey(s3Key: string): Promise<MediaAsset | null> {
    return this.mediaRepo.findOne({ where: { s3Key } });
  }
}
