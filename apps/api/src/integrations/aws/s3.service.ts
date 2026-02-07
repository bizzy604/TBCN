import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('AWS_S3_ENDPOINT');
    const region = config.get<string>('AWS_REGION', 'us-east-1');

    this.bucket = config.get<string>('AWS_S3_BUCKET', 'brandcoach-media');

    this.s3 = new S3Client({
      region,
      ...(endpoint && {
        endpoint,
        forcePathStyle: true, // Required for LocalStack
      }),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', 'test'),
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY', 'test'),
      },
    });

    // Ensure bucket exists on startup (dev only)
    this.ensureBucket().catch((err) =>
      this.logger.warn(`Could not ensure S3 bucket: ${err.message}`),
    );
  }

  /** Create bucket if it doesn't exist (for LocalStack dev) */
  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      this.logger.log(`Creating S3 bucket: ${this.bucket}`);
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  /** Generate a presigned PUT URL for client-side upload */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ uploadUrl: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    return { uploadUrl, key };
  }

  /** Generate a presigned GET URL for secure downloads */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /** Direct server-side upload */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return this.getObjectUrl(key);
  }

  /** Delete an object from S3 */
  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  /** Check if object exists */
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /** Get the public URL (or endpoint-based URL) of an object */
  getObjectUrl(key: string): string {
    const endpoint = this.config.get<string>('AWS_S3_ENDPOINT');
    if (endpoint) {
      return `${endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  get bucketName(): string {
    return this.bucket;
  }
}