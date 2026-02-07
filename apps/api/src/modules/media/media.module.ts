import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UploadService } from './upload.service';
import { MediaAsset } from './entities/media-asset.entity';
import { S3Service } from '../../integrations/aws/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaAsset])],
  controllers: [MediaController],
  providers: [MediaService, UploadService, S3Service],
  exports: [MediaService],
})
export class MediaModule {}
