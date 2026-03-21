## accessToken 过期时流程是怎样的？

### 标准流程（前端自动处理）

1. 前端请求接口 → 401（token 过期）
2. 前端拦截 401（axios interceptor / fetch wrapper）
3. 前端调用 POST /auth/refresh
   - refreshToken 通常放在 httpOnly cookie（前端 JS 读不到，但浏览器会自动带上）
4. 后端验证 refreshToken（数据库查 + expiresAt + isRevoked）
5. 后端返回新的 accessToken
6. 前端用新 accessToken 重试刚才的请求

---

## JWT 全局守卫 + @Public() 白名单方案

### 1. 概述

实现全局 JWT 认证守卫，所有接口默认需要 token 验证，通过 `@Public()` 装饰器标记的接口跳过验证。

**方案选择**：使用纯 `@nestjs/jwt` 实现，不依赖 Passport，更轻量、可控。

### 2. 文件结构

```
src/
├── common/
│   ├── decorators/
│   │   └── public.decorator.ts      # @Public() 装饰器
│   └── guards/
│       └── jwt-auth.guard.ts        # JWT 认证守卫
```

### 3. 实现方案

#### 3.1 @Public() 装饰器

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### 3.2 JWT 认证守卫（纯 @nestjs/jwt）

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 检查是否为白名单接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. 从 Header 提取 token
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // 3. 验证 token
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload; // 注入用户信息到 request
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### 3.3 全局注册

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

#### 3.4 JwtModule 全局导出

Guard 需要注入 `JwtService`，确保 `JwtModule` 在 `AuthModule` 中导出：

```typescript
// auth.module.ts
@Module({
  imports: [JwtModule.registerAsync({ ... })],
  exports: [JwtModule],  // 导出 JwtModule
})
export class AuthModule {}
```

### 4. 使用示例

```typescript
// 需要认证的接口（默认）
@Controller('projects')
export class ProjectsController {
  @Get()
  findAll(@Req() req) {
    const user = req.user; // { userId, email }
  }
}

// 白名单接口
@Controller('auth')
export class AuthController {
  @Public()
  @Post('sign-in')
  signIn() {}

  @Public()
  @Post('sign-up')
  signUp() {}

  @Public()
  @Post('refresh')
  refresh() {}
}

// 整个 Controller 都是白名单
@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {}
}
```

### 5. 白名单接口清单

| 路径                | 方法 | 说明       |
| ------------------- | ---- | ---------- |
| `/api/auth/sign-in` | POST | 用户登录   |
| `/api/auth/sign-up` | POST | 用户注册   |
| `/api/auth/refresh` | POST | 刷新 token |
| `/api/health`       | GET  | 健康检查   |

### 6. 依赖

无需额外安装，使用已有的 `@nestjs/jwt`。

### 7. 请求头格式

```
Authorization: Bearer <accessToken>
```

### 8. 错误响应

| 状态码           | 场景                                   |
| ---------------- | -------------------------------------- |
| 401 Unauthorized | 未提供 token / token 无效 / token 过期 |

### 9. 为什么不用 Passport？

| 对比       | Passport                                 | 纯 JWT       |
| ---------- | ---------------------------------------- | ------------ |
| 依赖       | @nestjs/passport, passport, passport-jwt | 无额外依赖   |
| 复杂度     | 策略抽象、概念多                         | 直观、代码少 |
| 适用       | 多种认证策略混用                         | 只需 JWT     |
| 飞书 OAuth | 也可以自己实现                           | 直接调用 API |

---

## 登录认证完整流程

### 1. 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         前端 (React)                            │
├─────────────────────────────────────────────────────────────────┤
│  LoginPage.tsx  →  httpClient  →  localStorage (accessToken)   │
│                         ↓                                       │
│              request.ts (请求拦截/响应拦截/Token刷新)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                        后端 (NestJS)                            │
├─────────────────────────────────────────────────────────────────┤
│  JwtAuthGuard (全局守卫)                                        │
│       ↓                                                         │
│  AuthController → AuthService → Database (User, RefreshToken)  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Token 双令牌机制

| Token 类型   | 存储位置        | 有效期  | 用途             |
| ------------ | --------------- | ------- | ---------------- |
| accessToken  | localStorage    | 15 分钟 | API 请求认证     |
| refreshToken | httpOnly Cookie | 30 天   | 刷新 accessToken |

### 3. 登录流程

```
用户输入邮箱密码
       ↓
POST /api/auth/sign-in
       ↓
后端验证 → 生成 accessToken + refreshToken
       ↓
accessToken 返回给前端 → 存入 localStorage
refreshToken 写入 Cookie (httpOnly: true, path: /api/auth/refresh-token)
       ↓
前端跳转到首页
```

### 4. Token 刷新流程（自动无感刷新）

```
用户请求 API
       │
accessToken 是否过期？
       │
    ┌──┴──┐
    否    是
    │     │
 正常请求  返回 401 (TOKEN_EXPIRED)
          │
     调用 /api/auth/refresh-token
     （多个请求同时 401 时，只刷新一次，其他请求排队等待）
          │
     获取新 accessToken → 存入 localStorage
          │
     重新发送原请求
          │
     ┌────┴────┐
  刷新成功   刷新失败 (REFRESH_TOKEN_*)
     │           │
  继续业务    跳转登录页
```

---

## 核心代码实现

### 1. 后端：错误码定义

```typescript
// apps/i18n-api/src/common/constants/error.ts
export const ERROR_CODE = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED', // accessToken 过期
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND', // 未提供 accessToken
  TOKEN_INVALID: 'TOKEN_INVALID', // accessToken 无效
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED', // refreshToken 过期
  REFRESH_TOKEN_REVOKED: 'REFRESH_TOKEN_REVOKED', // refreshToken 已撤销
  REFRESH_TOKEN_NOT_FOUND: 'REFRESH_TOKEN_NOT_FOUND', // 未提供 refreshToken
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID', // refreshToken 无效
} as const;
```

### 2. 后端：JWT 认证守卫

```typescript
// apps/i18n-api/src/common/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. 白名单检查
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. 提取并验证 Token
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({
        message: '未提供认证令牌',
        code: ERROR_CODE.TOKEN_NOT_FOUND,
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          message: '认证令牌已过期',
          code: ERROR_CODE.TOKEN_EXPIRED, // 前端据此判断是否刷新
        });
      }
      throw new UnauthorizedException({
        message: '认证令牌无效',
        code: ERROR_CODE.TOKEN_INVALID,
      });
    }
    return true;
  }
}
```

### 3. 后端：刷新 Token 接口

```typescript
// apps/i18n-api/src/modules/auth/auth.controller.ts
@PublicRoute()
@Post('refresh-token')
async refreshToken(@Req() req: FastifyRequest) {
  const refreshToken = req.cookies.refreshToken;

  // 验证 refreshToken 存在性
  if (!refreshToken) {
    throw new UnauthorizedException({
      message: '未提供刷新令牌',
      code: ERROR_CODE.REFRESH_TOKEN_NOT_FOUND,
    });
  }

  // 从数据库查询 token 记录
  const token = await this.authService.getRefreshToken(refreshToken);

  // 验证 token 有效性
  if (!token) {
    throw new UnauthorizedException({ code: ERROR_CODE.REFRESH_TOKEN_INVALID });
  }
  if (token.expiresAt < new Date()) {
    throw new UnauthorizedException({ code: ERROR_CODE.REFRESH_TOKEN_EXPIRED });
  }
  if (token.isRevoked) {
    throw new UnauthorizedException({ code: ERROR_CODE.REFRESH_TOKEN_REVOKED });
  }

  // 生成新的 accessToken
  const accessToken = await this.authService.generateAccessToken(token.user);
  return { accessToken };
}
```

### 4. 前端：Token 刷新机制（核心）

```typescript
// apps/i18n-web/src/services/request.ts

// Token 刷新状态管理（确保多个请求只刷新一次）
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// 执行所有等待中的请求
function onRefreshed(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken));
  pendingRequests = []; // 避免造成“幽灵请求”
}

// 通知所有等待的请求刷新失败
function onRefreshFailed(error: Error) {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = []; // 避免造成“幽灵请求”
}

// 刷新 access token
async function refreshAccessToken(): Promise<string> {
  const response = await fetch(`${env.apiBaseUrl}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include', // 携带 Cookie
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new HttpError(data.message, response.status, data.code);
  }
  return data.data.accessToken;
}
```

### 5. 前端：请求方法中的 401 处理

```typescript
// apps/i18n-web/src/services/request.ts - request 方法核心逻辑

// 处理 401 未授权
if (response.status === 401) {
  const errorData = data as ApiErrorResponse;

  // refresh_token 相关错误 → 需要重新登录
  if (
    errorData.code === ERROR_CODE.REFRESH_TOKEN_EXPIRED ||
    errorData.code === ERROR_CODE.REFRESH_TOKEN_INVALID ||
    errorData.code === ERROR_CODE.REFRESH_TOKEN_REVOKED ||
    errorData.code === ERROR_CODE.REFRESH_TOKEN_NOT_FOUND
  ) {
    removeToken();
    window.location.replace('/login');
    throw new HttpError(errorData.message, response.status, errorData.code);
  }

  // access_token 过期 → 尝试刷新（且不是重试请求）
  if (errorData.code === ERROR_CODE.TOKEN_EXPIRED && !_retry) {
    try {
      const newToken = await this.handleTokenRefresh();
      setToken(newToken);
      // 使用新 token 重新发送原请求
      return this.request<T>(endpoint, {
        ...config,
        _retry: true,
        headers: { ...config.headers, Authorization: `Bearer ${newToken}` },
      });
    } catch (refreshError) {
      removeToken();
      window.location.replace('/login');
      throw refreshError;
    }
  }
}
```

### 6. 前端：并发请求排队机制

```typescript
// apps/i18n-web/src/services/request.ts

// 处理 token 刷新（确保多个请求只刷新一次）
private async handleTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // 已有刷新请求在进行中，加入等待队列
    return new Promise<string>((resolve, reject) => {
      pendingRequests.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    onRefreshed(newToken);  // 通知所有等待的请求
    return newToken;
  } catch (error) {
    onRefreshFailed(error instanceof Error ? error : new Error('刷新令牌失败'));
    throw error;
  } finally {
    isRefreshing = false;
  }
}
```

---

## 错误码与处理策略

| 错误码                  | HTTP 状态 | 触发场景                 | 前端处理策略              |
| ----------------------- | --------- | ------------------------ | ------------------------- |
| TOKEN_NOT_FOUND         | 401       | 请求未携带 token         | 跳转登录页                |
| TOKEN_EXPIRED           | 401       | accessToken 过期         | 自动刷新 token 并重试请求 |
| TOKEN_INVALID           | 401       | accessToken 被篡改       | 跳转登录页                |
| REFRESH_TOKEN_NOT_FOUND | 401       | Cookie 中无 refreshToken | 跳转登录页                |
| REFRESH_TOKEN_EXPIRED   | 401       | refreshToken 过期        | 跳转登录页                |
| REFRESH_TOKEN_INVALID   | 401       | refreshToken 无效        | 跳转登录页                |
| REFRESH_TOKEN_REVOKED   | 401       | refreshToken 已撤销      | 跳转登录页                |

---

## 关键设计点

1. **双令牌分离存储**：accessToken 存 localStorage（前端可读），refreshToken 存 Cookie（自动携带）
2. **并发刷新控制**：多个请求同时 401 时，只发起一次刷新，其他请求排队等待结果
3. **防止无限循环**：使用 `_retry` 标记，重试请求不再触发刷新
4. **错误码精细化**：区分 accessToken 和 refreshToken 的各种错误场景，前端据此决定刷新还是重新登录

---
