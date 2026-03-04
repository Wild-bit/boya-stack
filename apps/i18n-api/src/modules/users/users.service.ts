// CURSOR_RULE_ACTIVE
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LoginFormDataDto } from '@/modules/auth/auth.controller';
import { generateUUID } from '@/utils/uuid';
import { TeamRole } from '@/generated/prisma/client';
import slugify from 'slugify';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 创建用户并自动创建默认团队
   * - 用户成为团队 owner
   * - 用户成为团队第一个成员（ADMIN 角色）
   */
  async create(body: LoginFormDataDto) {
    const userId = generateUUID();

    // 生成团队 slug（基于邮箱前缀 + 随机后缀，确保唯一性）
    const emailPrefix = body.email.split('@')[0] || 'user';
    const baseSlug = slugify(emailPrefix, { lower: true, strict: true });
    const slug = `${baseSlug}-${generateUUID().slice(0, 8)}`;
    const teamName = `${emailPrefix} 的团队`;

    // 使用事务确保数据一致性
    return this.prisma.$transaction(async (tx) => {
      // 1. 创建用户
      const user = await tx.user.create({
        data: {
          id: userId,
          email: body.email,
          password: body.password,
          name: body.email,
          lastLoginAt: new Date(),
        },
      });

      // 2. 创建默认团队（用户为 owner）
      const team = await tx.team.create({
        data: {
          name: teamName,
          slug,
          ownerId: userId,
        },
      });

      // 3. 将用户添加为团队成员（ADMIN 角色）
      await tx.teamMember.create({
        data: {
          userId,
          teamId: team.id,
          role: TeamRole.ADMIN,
          joinedAt: new Date(),
        },
      });

      return user;
    });
  }
}
