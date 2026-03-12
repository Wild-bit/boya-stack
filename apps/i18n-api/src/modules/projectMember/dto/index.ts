import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ProjectRole } from '@/generated/prisma/client';
export class CreateProjectMemberDto {
  @ApiProperty({ description: '项目ID' })
  @IsString()
  @IsNotEmpty({ message: '项目ID不能为空' })
  projectId: string;

  @ApiProperty({ description: '用户ID' })
  @IsString()
  @IsNotEmpty({ message: '用户ID不能为空' })
  userId: string;

  @ApiProperty({ description: '角色', enum: ProjectRole })
  @IsString()
  @IsNotEmpty({ message: '角色不能为空' })
  role: ProjectRole;
}
