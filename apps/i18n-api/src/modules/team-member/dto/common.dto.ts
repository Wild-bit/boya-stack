import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole } from '@/generated/prisma/client';

export class FindTeamMembersDto {
  @ApiProperty({ description: '团队ID' })
  @IsString()
  @IsNotEmpty({ message: '团队ID不能为空' })
  teamId: string;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ description: '成员记录ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: '角色', enum: TeamRole })
  @IsEnum(TeamRole)
  role: TeamRole;
}

export class RemoveMemberDto {
  @ApiProperty({ description: '成员记录ID' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
