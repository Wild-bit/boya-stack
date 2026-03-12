import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  Get,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { IntersectionType, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { EmailDto, PasswordDto } from '@/common/dto/common.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { PublicRoute } from '@/common/decorators/publicRoute.decorator';
import { ERROR_CODE } from '@/common/constants/error';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginFormDataDto extends IntersectionType(EmailDto, PasswordDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  avatar?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone?: string;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  feishuId?: string;
}

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('sign-in')
  @ApiOperation({ summary: '用户登录' })
  async signIn(
    @Body() data: LoginFormDataDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.authService.signIn(data, userAgent);
    res.setCookie('refreshToken', result.refreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      path: 'api/auth/refresh-token',
      sameSite: 'lax', // ⭐ 关键
    });
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        name: result.user.name,
        avatar: result.user.avatar,
        bio: result.user.bio,
        isActive: result.user.isActive,
        lastLoginAt: result.user.lastLoginAt,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      accessToken: result.accessToken,
    };
  }

  @PublicRoute()
  @Post('refresh-token')
  @ApiOperation({ summary: '刷新认证令牌' })
  async refreshToken(@Req() req: FastifyRequest) {
    console.log('parsed cookies:', req.cookies);
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: '未提供刷新令牌',
        code: ERROR_CODE.REFRESH_TOKEN_NOT_FOUND,
      });
    }
    const token = await this.authService.getRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException({
        message: '刷新令牌无效',
        code: ERROR_CODE.REFRESH_TOKEN_INVALID,
      });
    }
    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException({
        message: '刷新令牌已过期',
        code: ERROR_CODE.REFRESH_TOKEN_EXPIRED,
      });
    }
    if (token.isRevoked) {
      throw new UnauthorizedException({
        message: '刷新令牌已撤销',
        code: ERROR_CODE.REFRESH_TOKEN_REVOKED,
      });
    }
    const accessToken = await this.authService.generateAccessToken(token.user);
    return {
      accessToken,
    };
  }

  @PublicRoute()
  @Get('feishu/callback')
  @ApiOperation({ summary: '飞书回调' })
  async feishuCallback(
    @Query('code') code: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.authService.feishuCallback(code, userAgent);

    // 设置 refreshToken cookie
    res.setCookie('refreshToken', result.refreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      path: 'api/auth/refresh-token',
      sameSite: 'lax',
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        phone: result.user.phone,
        name: result.user.name,
        avatar: result.user.avatar,
        bio: result.user.bio,
        isActive: result.user.isActive,
        lastLoginAt: result.user.lastLoginAt,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      },
      accessToken: result.accessToken,
    };
  }

  @PublicRoute()
  @Get('feishu/auth-url')
  @ApiOperation({ summary: '获取飞书授权 URL' })
  async feishuAuthUrl() {
    const result = await this.authService.getFeishuAuthUrl();
    return result;
  }

  @PublicRoute()
  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Body() data: EmailDto & PasswordDto) {
    await this.authService.resetPassword(data.email, data.password);
    return {
      message: '密码重置成功',
    };
  }

  @Post('sign-out')
  @ApiOperation({ summary: '退出登录' })
  async signOut(@Req() req: FastifyRequest) {
    const refreshToken = req.cookies.refreshToken;
    const userId = req.user?.sub;
    if (!userId) {
      throw new NotFoundException('用户不存在');
    }
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: '未提供刷新令牌',
        code: ERROR_CODE.REFRESH_TOKEN_NOT_FOUND,
      });
    }
    await this.authService.signOut(refreshToken);
    return {
      message: '退出成功',
    };
  }
}
