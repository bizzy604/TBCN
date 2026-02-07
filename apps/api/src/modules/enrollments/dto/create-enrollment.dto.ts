import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'Program ID to enroll in' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  programId: string;
}
