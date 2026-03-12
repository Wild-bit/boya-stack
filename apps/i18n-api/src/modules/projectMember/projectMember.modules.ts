import { Module } from '@nestjs/common';
import { ProjectMemberService } from './projectMember.service';
import { ProjectMemberController } from './projectMember.controller';

@Module({
  controllers: [ProjectMemberController],
  providers: [ProjectMemberService],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}
