import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({ example: 'Hi, are you available tomorrow for a quick check-in?' })
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  content: string;
}
