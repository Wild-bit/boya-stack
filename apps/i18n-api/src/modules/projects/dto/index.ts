// CURSOR_RULE_ACTIVE
/**
 * 创建项目 DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', example: 'My Awesome Project' })
  @IsString()
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(50, { message: '项目名称最多50个字符' })
  name: string;

  @ApiProperty({ description: '团队ID' })
  @IsString()
  @IsNotEmpty({ message: '团队ID不能为空' })
  teamId: string;

  @ApiProperty({ description: '源语言' })
  @IsString()
  @IsNotEmpty({ message: '源语言不能为空' })
  sourceLocale: string;

  @ApiProperty({ description: '目标语言' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ message: '目标语言不能为空' })
  @ArrayMinSize(1, { message: '目标语言至少需要一个' })
  targetLanguages: string[];

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '项目描述最多200个字符' })
  description?: string;
}

export class EditProjectDto {
  @ApiProperty({ description: '项目ID' })
  @IsString()
  @IsNotEmpty({ message: '项目ID不能为空' })
  id: string;

  @ApiProperty({ description: '项目名称', example: 'My Awesome Project' })
  @IsString()
  @IsNotEmpty({ message: '项目名称不能为空' })
  @MaxLength(50, { message: '项目名称最多50个字符' })
  name?: string;

  @ApiPropertyOptional({ description: '项目描述' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '项目描述最多200个字符' })
  description?: string;

  @ApiPropertyOptional({ description: '源语言' })
  @IsOptional()
  @IsString()
  sourceLocale?: string;

  @ApiPropertyOptional({ description: '目标语言' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: '目标语言至少需要一个' })
  targetLanguages?: string[];
}

export class DeleteProjectDto {
  @ApiProperty({ description: '项目ID' })
  @IsString()
  @IsNotEmpty({ message: '项目ID不能为空' })
  id: string;
}
