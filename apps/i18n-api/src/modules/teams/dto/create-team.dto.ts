// CURSOR_RULE_ACTIVE
/**
 * 创建团队 DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ description: '团队名称', example: 'My Awesome Team' })
  @IsString()
  @IsNotEmpty({ message: '团队名称不能为空' })
  @MaxLength(50, { message: '团队名称最多50个字符' })
  name: string;

  @ApiPropertyOptional({
    description: '团队标识（URL友好，不填则自动生成）',
    example: 'my-awesome-team',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'slug 最多50个字符' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug 只能包含小写字母、数字和连字符',
  })
  slug?: string;

  @ApiPropertyOptional({ description: '团队描述', example: '这是一个很棒的团队' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '团队描述最多200个字符' })
  description?: string;

  @ApiPropertyOptional({ description: '团队 Logo URL', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;
}
