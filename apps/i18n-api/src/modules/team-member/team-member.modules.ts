import { Module } from '@nestjs/common';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberService } from './team-member.service';

@Module({
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
})
export class TeamMemberModule {}
