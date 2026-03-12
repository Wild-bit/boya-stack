import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginFormDataDto } from './auth.controller';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { generateUUID } from '@/utils/uuid';
import type { User } from '@/generated/prisma/client';
import { ERROR_CODE } from '@/common/constants/error';
import { ConfigService } from '@nestjs/config';
import { FeishuAccessTokenResponse, FeishuUserInfo } from '@/common/types/api.types';
import { formatToUTC8Time } from '@/utils/date';

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresIn = 1000 * 60 * 60 * 24 * 30; // 30 days
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly grantType: string;
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.clientId = this.configService.get<string>('FEISHU_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('FEISHU_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('FEISHU_REDIRECT_URI') || '';
    this.grantType = this.configService.get<string>('FEISHU_GRANT_TYPE') || '';
  }

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
        avatar: body.avatar,
        name: body.name,
        password: hashedPassword,
      });
    } else {
      // 2) 用户存在 → 校验密码（你也可以复用 validateUser）
      await this.validateUser(body.email, body.password); // 密码错会抛 401
    }

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
      sub: user.id,
      email: user.email,
      name: user.name,
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

  async revokeRefreshToken(token: string) {
    return await this.prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * 飞书回调 - 完整登录流程
   * @param code 飞书授权码
   * @param userAgent 用户代理
   * @returns 用户信息和 token
   */
  async feishuCallback(code: string, userAgent: string) {
    // 1. 用 code 换取飞书 access_token
    const tokenRes = await fetch('https://open.feishu.cn/open-apis/authen/v2/oauth/token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: this.grantType,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as FeishuAccessTokenResponse;
    if (!tokenData.access_token) {
      console.error('飞书获取 token 失败:', tokenData);
      throw new UnauthorizedException({
        message: '飞书授权失败',
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });
    }

    // 2. 获取飞书用户信息
    const feishuUserInfo = await this.getFeishuUserInfo(tokenData.access_token);
    if (!feishuUserInfo?.data) {
      throw new UnauthorizedException({
        message: '获取飞书用户信息失败',
        code: ERROR_CODE.INVALID_CREDENTIALS,
      });
    }

    const userInfo = feishuUserInfo.data;

    // 3. 通过飞书登录（查找或创建用户）
    return this.signInWithFeishu(
      {
        feishuId: userInfo.open_id,
        email: userInfo.email || undefined,
        name: userInfo.name,
        avatar: userInfo.avatar_url,
        phone: userInfo.mobile || undefined,
      },
      userAgent
    );
  }

  /**
   * 飞书登录 - 不需要密码验证
   * @param feishuUser 飞书用户信息
   * @param userAgent 用户代理
   */
  async signInWithFeishu(
    feishuUser: {
      feishuId: string;
      email?: string;
      name: string;
      avatar?: string;
      phone?: string;
    },
    userAgent: string
  ) {
    // 1. 优先通过 feishuId 查找用户
    let user = await this.prisma.user.findUnique({
      where: { feishuId: feishuUser.feishuId },
    });

    // 2. 如果 feishuId 没找到，尝试通过邮箱查找并绑定
    if (!user && feishuUser.phone) {
      user = await this.usersService.findByPhone(feishuUser.phone);
      if (user) {
        // 绑定飞书 ID 到已有账户
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            feishuId: feishuUser.feishuId,
            avatar: user.avatar || feishuUser.avatar,
          },
        });
      }
    }

    // 3. 都没找到，创建新用户
    if (!user) {
      const hashedPassword = await hash(feishuUser.feishuId, 10); // 用 feishuId 作为默认密码
      user = await this.usersService.create({
        email: feishuUser.email || `${feishuUser.feishuId}@feishu.local`,
        name: feishuUser.name,
        password: hashedPassword,
        avatar: feishuUser.avatar,
        phone: feishuUser.phone,
        feishuId: feishuUser.feishuId,
      });
    }

    // 4. 更新最后登录时间
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. 生成系统的 accessToken 和 refreshToken
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = randomBytes(32).toString('hex');
    await this.saveRefreshToken({ userId: user.id, token: refreshToken, userAgent });

    return {
      user: {
        ...user,
        updatedAt: formatToUTC8Time(user.updatedAt),
        createdAt: formatToUTC8Time(user.createdAt),
        lastLoginAt: user.lastLoginAt ? formatToUTC8Time(user.lastLoginAt) : null,
      },
      accessToken,
      refreshToken,
    };
  }

  async getFeishuUserInfo(accessToken: string) {
    try {
      const res = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      return data as FeishuUserInfo;
    } catch (error) {
      throw new InternalServerErrorException('获取飞书用户信息失败', error as Error);
    }
  }

  /**
   * 获取飞书授权 URL
   * @returns
   */
  async getFeishuAuthUrl() {
    if (!this.clientId || !this.redirectUri) {
      throw new NotFoundException('FEISHU_CLIENT_ID or FEISHU_REDIRECT_URI is not set');
    }
    const encodeRedirectUri = encodeURIComponent(this.redirectUri);
    const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?client_id=${this.clientId}&redirect_uri=${encodeRedirectUri}&response_type=code`;
    return authUrl;
  }

  /**
   * 重置密码
   * @param email
   * @param newPassword
   * @returns
   */
  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.usersService.editPassword(user.id, newPassword);
    return {
      message: '密码重置成功',
    };
  }

  /**
   * 退出登录
   * @param refreshToken
   * @returns
   */
  async signOut(refreshToken: string) {
    const token = await this.getRefreshToken(refreshToken);
    console.log('token:', token);
    if (!token) {
      throw new NotFoundException('刷新令牌不存在');
    }
    await this.prisma.refreshToken.delete({
      where: { id: token.id },
    });
    await this.prisma.user.update({
      where: { id: token.userId },
      data: { lastLoginAt: new Date() },
    });
    return {
      message: '退出成功',
    };
  }
}
