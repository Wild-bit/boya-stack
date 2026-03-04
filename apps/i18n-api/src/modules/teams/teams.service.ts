// CURSOR_RULE_ACTIVE
import { Injectable, ConflictException } from '@nestjs/common';
import slugify from 'slugify';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto, FindTeamsDto } from './dto';
import { toPaginationOptions, toPaginatedResult } from '@/common/utils/pagination.util';
import type { PaginatedResult } from '@/common/types/pagination.types';
import type { Team } from '@/generated/prisma/client';
import { TeamRole } from '@/generated/prisma/client';
import { generateUUID } from '@/utils/uuid';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建团队
   * @param dto 创建团队参数
   * @param ownerId 团队所有者 ID（从 JWT 获取）
   */
  async createTeam(dto: CreateTeamDto, ownerId: string): Promise<Team> {
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
          ownerId,
        },
      });

      // 2. 将创建者添加为团队成员（ADMIN 角色）
      await tx.teamMember.create({
        data: {
          userId: ownerId,
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
    const uniqueSuffix = generateUUID().slice(0, 8);
    return `${baseSlug}-${uniqueSuffix}`;
  }

  // 分页查询团队
  async findAll(dto: FindTeamsDto): Promise<PaginatedResult<Team>> {
    const options = toPaginationOptions(dto);
    const { keyword, ownerId } = dto;

    // 构建查询条件
    const where = {
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' as const } },
          { slug: { contains: keyword, mode: 'insensitive' as const } },
        ],
      }),
      ...(ownerId && { ownerId }),
    };

    // 并行查询数据和总数
    const [items, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip: options.skip, // 跳过前面多少条记录（用于分页） 在数据库SQL相当于 limit 10 offset 10
        take: options.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.team.count({ where }),
    ]);

    return toPaginatedResult(items, total, options);
  }

  // 根据 ID 查找团队
  async findById(id: string) {
    return this.prisma.team.findUnique({
      where: { id },
    });
  }
}
