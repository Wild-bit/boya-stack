import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginFormDataDto } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { generateUUID } from '@/utils/uuid';
import type { User } from '@/generated/prisma/client';
import { ERROR_CODE } from '@/common/constants/error';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresIn = 1000 * 60 * 60 * 24 * 30; // 30 days
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  /**
   *
   * 验证是否存在用户，并且密码是否正确
   * @param email
   * @param password
   * @returns
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException({
          message: '密码错误',
          code: ERROR_CODE.INVALID_CREDENTIALS,
          status: 401,
        });
      }
      return user;
    }
    return null;
  }

  /**
   * 登录
   * @param body
   * @returns
   */
  async signIn(body: LoginFormDataDto, userAgent: string) {
    let user = await this.usersService.findByEmail(body.email);

    // 1) 用户不存在 → 创建（注册）
    if (!user) {
      const hashedPassword = await hash(body.password, 10);
      user = await this.usersService.create({
        ...body,
        password: hashedPassword,
      });
    } else {
      // 2) 用户存在 → 校验密码（你也可以复用 validateUser）
      await this.validateUser(body.email, body.password); // 密码错会抛 401
    }
    console.log('JWT_SECRET=', process.env.JWT_SECRET);

    // 3) 登录成功 → 生成 token（两种情况都走这里）
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    const refreshToken = randomBytes(32).toString('hex');
    await this.saveRefreshToken({ userId: user.id, token: refreshToken, userAgent });
    return {
      user: user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * 保存刷新令牌
   * @param payload { userId: string; token: string; userAgent: string }
   * @returns
   */
  async saveRefreshToken(payload: { userId: string; token: string; userAgent: string }) {
    return await this.prisma.refreshToken.create({
      data: {
        id: generateUUID(),
        userId: payload.userId,
        token: payload.token,
        userAgent: payload.userAgent,
        expiresAt: new Date(Date.now() + this.refreshTokenExpiresIn), // 30 days
      },
    });
  }

  async generateAccessToken(user: User) {
    return await this.jwtService.signAsync({
      ...user,
    });
  }

  /**
   * 获取刷新令牌
   * @param token
   * @returns
   */
  async getRefreshToken(token: string) {
    return await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }
}
