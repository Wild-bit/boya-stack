// CURSOR_RULE_ACTIVE
/**
 * 通用 DTO 定义
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class EmailDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsOptional()
  @IsString()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}

export class PasswordDto {
  @ApiProperty({
    description: '密码（至少8位，包含字母、数字和特殊字符）',
    example: 'Password@123',
  })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(8, { message: '密码至少8位' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: '密码至少8位，包含字母、数字和特殊字符',
  })
  password: string;
}

export class IdParamDto {
  @ApiProperty({ description: 'ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty({ message: 'ID 不能为空' })
  id: string;
}
