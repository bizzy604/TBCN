import {
  Controller,
  Post,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { RequestPresignedUrlDto } from './dto/presigned-url.dto';
import { ConfirmUploadDto } from './dto/upload-file.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Media')
@Controller('media')
@ApiBearerAuth('JWT-auth')
export class MediaController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Request a presigned S3 upload URL' })
  @ApiResponse({ status: 201, description: 'Presigned URL created' })
  async getUploadUrl(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestPresignedUrlDto,
  ) {
    return this.uploadService.createPresignedUpload(
      userId,
      dto.fileName,
      dto.contentType,
      dto.mediaType,
      dto.fileSize,
    );
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm an upload and store media asset' })
  @ApiResponse({ status: 201, description: 'Upload confirmed' })
  async confirm(
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmUploadDto,
  ) {
    return this.uploadService.confirmUpload(
      userId,
      dto.s3Key,
      dto.fileSize,
      dto.metadata,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media asset' })
  async delete(@CurrentUser('id') userId: string, @Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Missing media key');
    }
    return this.uploadService.deleteUpload(userId, key);
  }
}
