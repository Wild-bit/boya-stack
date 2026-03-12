// CURSOR_RULE_ACTIVE
/**
 * 团队查询 DTO
 */

import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class FindTeamsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  keyword?: string;
}
