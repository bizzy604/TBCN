import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LessonResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() contentType: string;
  @ApiPropertyOptional() content: string | null;
  @ApiPropertyOptional() videoUrl: string | null;
  @ApiPropertyOptional() videoDuration: number | null;
  @ApiProperty() resourceUrls: string[];
  @ApiProperty() sortOrder: number;
  @ApiProperty() isFree: boolean;
  @ApiPropertyOptional() estimatedDuration: number | null;
}

export class ModuleResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() sortOrder: number;
  @ApiPropertyOptional() estimatedDuration: number | null;
  @ApiProperty({ type: [LessonResponseDto] }) lessons: LessonResponseDto[];
  @ApiProperty() lessonCount: number;
}

export class ProgramResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty() description: string;
  @ApiPropertyOptional() shortDescription: string | null;
  @ApiPropertyOptional() thumbnailUrl: string | null;
  @ApiPropertyOptional() bannerUrl: string | null;
  @ApiPropertyOptional() instructorId: string | null;
  @ApiProperty() status: string;
  @ApiProperty() difficulty: string;
  @ApiProperty() price: number;
  @ApiProperty() currency: string;
  @ApiProperty() isFree: boolean;
  @ApiPropertyOptional() estimatedDuration: number | null;
  @ApiProperty() tags: string[];
  @ApiProperty() prerequisites: string[];
  @ApiProperty() learningOutcomes: string[];
  @ApiPropertyOptional() maxEnrollments: number | null;
  @ApiProperty() enrollmentCount: number;
  @ApiPropertyOptional() averageRating: number | null;
  @ApiProperty() totalRatings: number;
  @ApiPropertyOptional() publishedAt: string | null;
  @ApiProperty() createdAt: string;
  @ApiProperty() updatedAt: string;
  @ApiPropertyOptional({ type: [ModuleResponseDto] }) modules?: ModuleResponseDto[];
  @ApiPropertyOptional() instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export class ProgramSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiPropertyOptional() shortDescription: string | null;
  @ApiPropertyOptional() thumbnailUrl: string | null;
  @ApiProperty() difficulty: string;
  @ApiProperty() price: number;
  @ApiProperty() currency: string;
  @ApiProperty() isFree: boolean;
  @ApiProperty() enrollmentCount: number;
  @ApiPropertyOptional() averageRating: number | null;
  @ApiProperty() totalRatings: number;
  @ApiPropertyOptional() estimatedDuration: number | null;
  @ApiProperty() tags: string[];
  @ApiPropertyOptional() instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}
