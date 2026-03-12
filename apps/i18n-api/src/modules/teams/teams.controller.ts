// CURSOR_RULE_ACTIVE
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, FindTeamsDto, DeleteTeamDto } from './dto';
import { formatToUTC8Time } from '@/utils/date';

@ApiTags('团队')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: '获取当前用户加入的团队列表（分页）' })
  findAll(@Query() query: FindTeamsDto, @Request() req: FastifyRequest) {
    const userId = req.user?.sub as string;
    return this.teamsService.findAll(query, userId).then((res) => {
      return {
        ...res,
        items: res.items.map((item) => ({
          ...item,
          createdAt: formatToUTC8Time(item.createdAt),
          updatedAt: formatToUTC8Time(item.updatedAt),
        })),
      };
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: '根据 ID 获取团队' })
  findBySlug(@Param('slug') slug: string) {
    return this.teamsService
      .findBySlug(slug)
      .then((res) => {
        if (!res) {
          throw new NotFoundException('团队不存在');
        }
        return {
          id: res.id,
          name: res.name,
          slug: res.slug,
          ownerId: res.ownerId,
          createdAt: formatToUTC8Time(res.createdAt),
          updatedAt: formatToUTC8Time(res.updatedAt),
        };
      })
      .catch((err) => {
        throw new NotFoundException(err.message);
      });
  }

  @Post()
  @ApiOperation({ summary: '创建团队' })
  create(@Body() body: CreateTeamDto) {
    return this.teamsService.createTeam(body);
  }

  @Post(':id')
  @ApiOperation({ summary: '更新团队' })
  update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, body);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除团队' })
  delete(@Body() body: DeleteTeamDto) {
    return this.teamsService.deleteTeam(body.id);
  }
}
