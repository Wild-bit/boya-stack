import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProjectDto } from './dto';
import { FastifyRequest } from 'fastify';
import { PaginationQuery } from '@/common/types/pagination.types';
import { formatToUTC8Time } from '@/utils/date';

@ApiTags('项目')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  @ApiOperation({ summary: '创建项目' })
  create(@Body() body: CreateProjectDto, @Req() req: FastifyRequest) {
    const userId = req.user?.sub as string;
    console.log('userId:', userId);
    return this.projectsService.create(body, userId);
  }

  @Get('list')
  @ApiOperation({ summary: '获取项目列表' })
  async list(
    @Query('teamSlug') teamSlug: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('search') search?: string
  ) {
    const paginationQuery: PaginationQuery & { search?: string } = {
      page,
      pageSize,
      search: search || undefined,
    };
    const projects = await this.projectsService.list(teamSlug, paginationQuery);
    return {
      ...projects,
      items: projects.items.map((project) => ({
        ...project,
        createdAt: formatToUTC8Time(project.createdAt),
        updatedAt: formatToUTC8Time(project.updatedAt),
      })),
    };
  }

  @Get('project-by-slug')
  @ApiOperation({ summary: '根据 slug 获取项目' })
  async getProjectBySlug(@Query('teamSlug') teamSlug: string, @Query('slug') slug: string) {
    const project = await this.projectsService.getProjectBySlug(teamSlug, slug);
    return {
      ...project,
      createdAt: formatToUTC8Time(project.createdAt),
      updatedAt: formatToUTC8Time(project.updatedAt),
    };
  }
}
