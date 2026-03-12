import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectDto } from './dto';
import { nanoid } from 'nanoid';
import { generateUUID } from '@/utils/uuid';
import { ProjectMemberService } from '@/modules/projectMember/projectMember.service';
import { Prisma, ProjectRole } from '@/generated/prisma/client';
import { PaginationQuery } from '@/common/types/pagination.types';
import { toPaginatedResult, toPaginationOptions } from '@/common/utils/pagination.util';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectMemberService: ProjectMemberService
  ) {}

  async create(body: CreateProjectDto, userId: string) {
    const slug = nanoid(8);

    this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          ...body,
          slug,
          id: generateUUID(),
        },
      });

      await this.projectMemberService.create({
        projectId: project.id,
        userId: userId,
        role: ProjectRole.ADMIN,
      });

      return project;
    });
  }

  async list(teamSlug: string, options: PaginationQuery & { search?: string }) {
    const paginationOptions = toPaginationOptions(options);
    const where: Prisma.ProjectWhereInput = { team: { slug: teamSlug } };
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { slug: { contains: options.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: paginationOptions.skip,
        take: paginationOptions.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          sourceLocale: true,
          targetLanguages: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { keys: true } },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    const mapped = items.map(({ _count, ...rest }) => ({
      ...rest,
      keyCount: _count.keys,
    }));
    return toPaginatedResult(mapped, total, paginationOptions);
  }

  async getProjectBySlug(teamSlug: string, slug: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug: teamSlug },
    });
    if (!team) {
      throw new NotFoundException('团队不存在');
    }
    const project = await this.prisma.project.findFirst({
      where: { teamId: team.id, slug },
    });
    if (!project) {
      throw new NotFoundException('项目不存在');
    }
    return project;
  }
}
