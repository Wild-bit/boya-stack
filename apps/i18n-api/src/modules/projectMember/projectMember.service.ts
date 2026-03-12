import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProjectMemberDto } from './dto';
import { generateUUID } from '@/utils/uuid';

@Injectable()
export class ProjectMemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateProjectMemberDto) {
    return this.prisma.projectMember.create({
      data: {
        ...body,
        id: generateUUID(),
        joinedAt: new Date(),
      },
    });
  }
}
