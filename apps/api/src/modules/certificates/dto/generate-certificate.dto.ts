import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateCertificateDto {
  @ApiProperty({
    description: 'Enrollment ID to issue certificate for',
    example: '5bf92f50-660f-4552-aab5-8d5ebf4a5505',
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;
}
