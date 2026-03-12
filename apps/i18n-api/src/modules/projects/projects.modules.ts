import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectMemberModule } from '@/modules/projectMember/projectMember.modules';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
  imports: [ProjectMemberModule],
})
export class ProjectsModule {}
