import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionResultDto {
  @ApiProperty() questionId: string;
  @ApiProperty() questionText: string;
  @ApiProperty() userAnswer: string;
  @ApiProperty() correct: boolean;
  @ApiProperty() points: number;
  @ApiProperty() earnedPoints: number;
}

export class AssessmentResultDto {
  @ApiProperty() submissionId: string;
  @ApiProperty() assessmentId: string;
  @ApiProperty() score: number;
  @ApiProperty() totalPoints: number;
  @ApiProperty() percentage: number;
  @ApiProperty() passed: boolean;
  @ApiProperty() attemptNumber: number;
  @ApiProperty() attemptsRemaining: number;
  @ApiPropertyOptional() feedback: string | null;
  @ApiProperty({ type: [QuestionResultDto] }) results: QuestionResultDto[];
}
