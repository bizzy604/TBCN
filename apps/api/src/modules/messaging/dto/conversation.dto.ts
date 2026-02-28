import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto';

export class ConversationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Optional peer user ID for direct conversation thread' })
  @IsOptional()
  @IsUUID()
  peerId?: string;
}
