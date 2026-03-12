import { Body, Controller, Get, NotFoundException, Param, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginFormDataDto } from '../auth/auth.controller';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { formatToUTC8Time } from '@/utils/date';
import { FastifyRequest } from 'fastify';
@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getMe(@Param('email') userEmail: string) {
    return this.findByEmail(userEmail);
  }

  @Get(':email')
  @ApiOperation({ summary: '根据邮箱查找用户' })
  async findByEmail(@Param('email') email: string) {
    const res = await this.usersService.findByEmail(email);
    if (!res) {
      throw new NotFoundException('用户不存在');
    }
    return {
      id: res.id,
      email: res.email,
      name: res.name,
      createdAt: formatToUTC8Time(res.createdAt),
      updatedAt: formatToUTC8Time(res.updatedAt),
      lastLoginAt: res.lastLoginAt,
      isActive: res.isActive,
      feishuId: res.feishuId,
      avatar: res.avatar,
      bio: res.bio,
    };
  }

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  createUser(@Body() body: LoginFormDataDto) {
    return this.usersService.create(body);
  }

  @Post('edit')
  @ApiOperation({ summary: '编辑用户信息' })
  editUserInfo(
    @Body() body: { name?: string; avatar?: string; bio?: string; phone?: string },
    @Req() req: FastifyRequest
  ) {
    const userId = req.user?.sub as string;
    return this.usersService.editUserInfo(userId, body);
  }
}
