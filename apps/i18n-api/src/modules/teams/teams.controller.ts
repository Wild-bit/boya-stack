// CURSOR_RULE_ACTIVE
import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, FindTeamsDto } from './dto';

@ApiTags('团队')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: '获取团队列表（分页）' })
  findAll(@Query() query: FindTeamsDto) {
    return this.teamsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取团队' })
  findById(@Param('id') id: string) {
    return this.teamsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建团队' })
  create(@Body() body: CreateTeamDto, @Request() req: FastifyRequest) {
    const userId = req.user?.sub as string;
    return this.teamsService.createTeam(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新团队' })
  update(@Param('id') id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.updateTeam(id, body);
  }
}
