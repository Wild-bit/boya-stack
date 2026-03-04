import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { IntersectionType, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { EmailDto, PasswordDto } from '@/common/dto/common.dto';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { PublicRoute } from '@/common/decorators/publicRoute.decorator';

export class LoginFormDataDto extends IntersectionType(EmailDto, PasswordDto) {}

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
      user: result.user,
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
      throw new UnauthorizedException('未提供认证令牌');
    }
    const token = await this.authService.getRefreshToken(refreshToken);
    if (!token) {
      throw new UnauthorizedException('认证令牌无效');
    }
    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('认证令牌已过期');
    }
    if (token.isRevoked) {
      throw new UnauthorizedException('认证令牌已撤销');
    }
    const accessToken = await this.authService.generateAccessToken(token.user);
    return {
      accessToken,
    };
  }
}
