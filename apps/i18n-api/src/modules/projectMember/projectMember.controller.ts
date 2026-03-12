import { Controller, Post, Body } from '@nestjs/common';
import { ProjectMemberService } from './projectMember.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateProjectMemberDto } from './dto';

@ApiTags('项目成员')
@ApiBearerAuth()
@Controller('project-members')
export class ProjectMemberController {
  constructor(private readonly projectMemberService: ProjectMemberService) {}

  @Post('create')
  @ApiOperation({ summary: '创建项目成员' })
  create(@Body() body: CreateProjectMemberDto) {
    return this.projectMemberService.create(body);
  }
}
