import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { FindTeamMembersDto, UpdateMemberRoleDto, RemoveMemberDto } from './dto/common.dto';
import { TeamRole } from '@/generated/prisma/client';

@Injectable()
export class TeamMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: FindTeamMembersDto) {
    return this.prisma.teamMember.findMany({
      where: { teamId: dto.teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            lastLoginAt: true,
          },
        },
      },
    });
  }

  async updateRole(dto: UpdateMemberRoleDto, operatorId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: dto.id },
      include: { team: true },
    });
    if (!member) throw new NotFoundException('成员不存在');

    const operator = await this.prisma.teamMember.findFirst({
      where: { teamId: member.teamId, userId: operatorId },
    });

    const isOwner = member.team.ownerId === operatorId;
    const isAdmin = operator?.role === TeamRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('无权修改成员角色');
    }

    // 只有 Owner 能设置/修改 ADMIN 角色
    if (dto.role === TeamRole.ADMIN && !isOwner) {
      throw new ForbiddenException('只有团队所有者能设置管理员');
    }

    // 不能修改 Owner 自己的角色
    if (member.userId === member.team.ownerId) {
      throw new ForbiddenException('不能修改团队所有者的角色');
    }

    return this.prisma.teamMember.update({
      where: { id: dto.id },
      data: { role: dto.role },
    });
  }

  async removeMember(dto: RemoveMemberDto, operatorId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: dto.id },
      include: { team: true },
    });
    if (!member) throw new NotFoundException('成员不存在');

    const isOwner = member.team.ownerId === operatorId;
    const operator = await this.prisma.teamMember.findFirst({
      where: { teamId: member.teamId, userId: operatorId },
    });
    const isAdmin = operator?.role === TeamRole.ADMIN;

    // 不能移除团队所有者
    if (member.userId === member.team.ownerId) {
      throw new ForbiddenException('不能移除团队所有者');
    }

    // Owner 可以移除任何人
    if (isOwner) {
      return this.prisma.teamMember.delete({ where: { id: dto.id } });
    }

    // Admin 只能移除非 Admin 成员
    if (isAdmin && member.role !== TeamRole.ADMIN) {
      return this.prisma.teamMember.delete({ where: { id: dto.id } });
    }

    throw new ForbiddenException('无权移除该成员');
  }
}
