import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great question. I suggest starting with your target audience pain points.' })
  @IsString()
  @MinLength(2)
  content: string;
}
