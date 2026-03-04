/**
 * JWT 认证守卫
 * 用于保护需要认证的端点
 */
import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '@/common/decorators/publicRoute.decorator';
import { ERROR_CODE } from '../constants/error';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  // 验证 token
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 检查是否为白名单接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        message: '未提供认证令牌',
        code: ERROR_CODE.TOKEN_NOT_FOUND,
      });
    }

    try {
      console.info('token:', token);
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: '认证令牌已过期',
          code: ERROR_CODE.TOKEN_EXPIRED,
        });
      }
      console.info('error:', error);
      throw new UnauthorizedException({
        message: '认证令牌无效',
        code: ERROR_CODE.TOKEN_INVALID,
      });
    }
    return true;
  }
  // 提取 token
  private extractToken(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
