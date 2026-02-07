import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollmentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty() programId: string;
  @ApiProperty() status: string;
  @ApiProperty() progressPercentage: number;
  @ApiProperty() completedLessons: number;
  @ApiProperty() totalLessons: number;
  @ApiPropertyOptional() lastAccessedAt: string | null;
  @ApiPropertyOptional() completedAt: string | null;
  @ApiProperty() enrolledAt: string;
  @ApiPropertyOptional() certificateId: string | null;
  @ApiPropertyOptional() program?: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    difficulty: string;
    instructorId: string | null;
  };
}

export class LessonProgressResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() enrollmentId: string;
  @ApiProperty() lessonId: string;
  @ApiProperty() completed: boolean;
  @ApiPropertyOptional() completedAt: string | null;
  @ApiProperty() timeSpent: number;
  @ApiProperty() lastPosition: number;
}
