import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CertificateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  programId: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  certificateNumber: string;

  @ApiProperty()
  verificationCode: string;

  @ApiProperty()
  recipientName: string;

  @ApiProperty()
  programTitle: string;

  @ApiPropertyOptional()
  completionDate: Date | null;

  @ApiProperty()
  issuedAt: Date;

  @ApiPropertyOptional()
  issuedBy: string | null;

  @ApiPropertyOptional()
  downloadUrl: string | null;

  @ApiProperty()
  isRevoked: boolean;

  @ApiPropertyOptional()
  revokedAt: Date | null;

  @ApiPropertyOptional()
  revokedReason: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
