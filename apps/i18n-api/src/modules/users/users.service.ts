// CURSOR_RULE_ACTIVE
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { LoginFormDataDto } from '@/modules/auth/auth.controller';
import { generateUUID } from '@/utils/uuid';
import { TeamRole } from '@/generated/prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  /**
   * 创建用户并自动创建默认团队
   * - 用户成为团队 owner
   * - 用户成为团队第一个成员（ADMIN 角色）
   */
  async create(
    body: LoginFormDataDto & {
      avatar?: string;
      name?: string;
      phone?: string;
      feishuId?: string;
    }
  ) {
    const userId = generateUUID();

    // 生成团队 slug（基于邮箱前缀或名称 + 随机后缀，确保唯一性）
    const nameOrEmail = body.name || body.email?.split('@')[0] || 'user';
    const baseSlug = slugify(nameOrEmail, { lower: true, strict: true });
    const slug = `${baseSlug}-${nanoid(8)}`;
    const teamName = `${nameOrEmail} 的团队`;

    // 使用事务确保数据一致性
    return this.prisma.$transaction(async (tx) => {
      // 1. 创建用户
      const user = await tx.user.create({
        data: {
          id: userId,
          email: body.email,
          password: body.password,
          name: body.name || body.email || body.phone || '用户',
          avatar: body.avatar,
          phone: body.phone,
          feishuId: body.feishuId,
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

  async editPassword(userId: string, newPassword: string) {
    const hashedPassword = await hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async editUserInfo(
    userId: string,
    data: { name?: string; avatar?: string; bio?: string; phone?: string }
  ) {
    return await this.prisma.user.update({
      where: { id: userId },
      omit: {
        password: true,
      },
      data,
    });
  }
}
