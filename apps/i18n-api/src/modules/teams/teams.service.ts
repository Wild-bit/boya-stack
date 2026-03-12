// CURSOR_RULE_ACTIVE
import { Injectable, ConflictException } from '@nestjs/common';
import slugify from 'slugify';
import { nanoid } from 'nanoid';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, FindTeamsDto } from './dto';
import { toPaginationOptions, toPaginatedResult } from '@/common/utils/pagination.util';
import type { PaginatedResult } from '@/common/types/pagination.types';
import type { Team } from '@/generated/prisma/client';
import { TeamRole } from '@/generated/prisma/client';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建团队
   * @param dto 创建团队参数
   * @param ownerId 团队所有者 ID（从 JWT 获取）
   */
  async createTeam(dto: CreateTeamDto): Promise<Team> {
    // 生成 slug（如果未提供）
    const slug = dto.slug || this.generateSlug(dto.name);

    // 检查 slug 是否已存在
    const existingTeam = await this.prisma.team.findUnique({ where: { slug } });
    if (existingTeam) {
      throw new ConflictException('团队标识已被使用');
    }

    // 使用事务创建团队和成员记录
    return this.prisma.$transaction(async (tx) => {
      // 1. 创建团队
      const team = await tx.team.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          logo: dto.logo,
          ownerId: dto.ownerId,
        },
      });

      // 2. 将创建者添加为团队成员（ADMIN 角色）
      await tx.teamMember.create({
        data: {
          userId: dto.ownerId,
          teamId: team.id,
          role: TeamRole.ADMIN,
        },
      });

      return team;
    });
  }

  /**
   * 更新团队
   */
  async updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
    // 如果更新 slug，检查是否冲突
    if (dto.slug) {
      const existingTeam = await this.prisma.team.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existingTeam) {
        throw new ConflictException('团队标识已被使用');
      }
    }

    return this.prisma.team.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 生成 URL 友好的 slug
   */
  private generateSlug(name: string): string {
    const baseSlug = slugify(name, { lower: true, strict: true });
    const uniqueSuffix = nanoid(8);
    return `${baseSlug}-${uniqueSuffix}`;
  }

  /**
   * 分页查询用户加入的团队
   * @param dto 查询参数
   * @param userId 当前用户 ID（只返回该用户加入的团队）
   */
  async findAll(dto: FindTeamsDto, userId: string): Promise<PaginatedResult<Team>> {
    const options = toPaginationOptions(dto);
    const { keyword } = dto;

    // 构建查询条件：只查询用户加入的团队（通过 TeamMember 关联）
    const where = {
      members: {
        some: { userId },
      },
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' as const } },
          { slug: { contains: keyword, mode: 'insensitive' as const } },
        ],
      }),
    };

    // 并行查询数据和总数
    const [items, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.team.count({ where }),
    ]);

    return toPaginatedResult(items, total, options);
  }

  // 根据 ID 查找团队
  async findBySlug(slug: string) {
    return this.prisma.team.findUnique({
      where: { slug },
    });
  }

  async deleteTeam(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // 找到所有项目
      const projects = await tx.project.findMany({
        where: { teamId: id },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);

      // 删除项目成员
      await tx.projectMember.deleteMany({
        where: {
          projectId: { in: projectIds },
        },
      });
      // 删除项目
      await tx.project.deleteMany({
        where: { teamId: id },
      });

      // 删除邀请链接
      // await tx.inviteLink.deleteMany({
      //   where: { teamId: id },
      // });

      // 删除团队成员
      await tx.teamMember.deleteMany({
        where: { teamId: id },
      });

      // 最后删除团队
      await tx.team.delete({
        where: { id },
      });
    });
  }
}
