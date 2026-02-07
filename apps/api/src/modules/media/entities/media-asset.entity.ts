import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

export enum MediaStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity('media_assets')
@Index('idx_media_assets_uploader', ['uploaderId'])
@Index('idx_media_assets_status', ['status'])
export class MediaAsset extends BaseEntity {
  @Column({ name: 'uploader_id', type: 'uuid' })
  uploaderId: string;

  @Column({ name: 'original_name', type: 'varchar', length: 500 })
  originalName: string;

  @Column({ name: 's3_key', type: 'varchar', length: 1000, unique: true })
  s3Key: string;

  @Column({ name: 'content_type', type: 'varchar', length: 255 })
  contentType: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE,
  })
  mediaType: MediaType;

  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.PENDING,
  })
  status: MediaStatus;

  @Column({ type: 'varchar', length: 2000, nullable: true })
  url: string | null;

  @Column({ type: 'jsonb', nullable: true, comment: 'Extra metadata (dimensions, duration…)' })
  metadata: Record<string, unknown> | null;
}