import { IsNotEmpty, IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentDto {
  @ApiProperty({ description: 'Enrollment ID' })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    description: 'Map of questionId -> answer',
    example: { 'q1-uuid': 'Option A', 'q2-uuid': 'true' },
  })
  @IsObject()
  answers: Record<string, string>;
}
