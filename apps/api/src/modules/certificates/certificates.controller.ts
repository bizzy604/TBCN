import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { CertificateResponseDto } from './dto/certificate-response.dto';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates')
@Controller('certificates')
@ApiBearerAuth('JWT-auth')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Generate certificate for a completed enrollment' })
  @ApiResponse({ status: 201, type: CertificateResponseDto })
  async generate(
    @Body() dto: GenerateCertificateDto,
    @CurrentUser('id') issuedBy: string,
  ) {
    return this.certificatesService.generate(dto, issuedBy);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my certificates' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.certificatesService.findMyCertificates(userId, page || 1, limit || 10);
  }

  @Get('verify/:verificationCode')
  @Public()
  @ApiOperation({ summary: 'Verify certificate by public verification code' })
  @ApiParam({ name: 'verificationCode', description: 'Certificate verification code' })
  async verify(@Param('verificationCode') verificationCode: string) {
    const certificate = await this.certificatesService.verifyByCode(verificationCode);
    return {
      valid: certificate.isValid,
      certificate,
    };
  }

  @Get('enrollment/:enrollmentId')
  @ApiOperation({ summary: 'Get certificate by enrollment ID' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment UUID' })
  async getByEnrollment(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.certificatesService.findByEnrollment(enrollmentId, {
      id: userId,
      role,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get certificate by ID' })
  @ApiParam({ name: 'id', description: 'Certificate UUID' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.certificatesService.findById(id, {
      id: userId,
      role,
    });
  }

  @Patch(':id/revoke')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke a certificate' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason?: string },
    @CurrentUser('id') revokedBy: string,
  ) {
    return this.certificatesService.revoke(id, body.reason || '', revokedBy);
  }
}
