# NestJS 教程文档（完整入门 + 核心概念详解）

## 目录

1.  NestJS 简介
2.  环境安装
3.  Nest 核心架构概念
    - Module（模块）
    - Controller（控制器）
    - Provider（服务）
    - Dependency Injection（依赖注入）
4.  生命周期
5.  中间件（Middleware）
    - Express 适配器中间件
    - **Fastify 适配器中间件（重要！）**
    - Fastify Hooks 对照表
6.  管道（Pipes）
    - 管道的作用
    - 使用场景（类型转换、DTO 验证、默认值、UUID）
    - 内置管道
    - 自定义管道
7.  守卫（Guards）
    - 守卫的作用
    - 使用场景（JWT 认证、角色权限、API Key、公开路由）
    - 守卫执行顺序
    - 管道 vs 守卫 对比
8.  拦截器（Interceptors）
9.  过滤器（Exception Filters）
10. DTO 与数据验证
11. 与数据库结合（TypeORM 示例）
12. 实战示例：用户管理 API
13. 总结

---

# 1. NestJS 简介

NestJS 是一个基于 TypeScript 的 Node.js 后端框架，构建在 Express（或
Fastify）之上。

核心特点：

- 使用 TypeScript
- 强大的依赖注入系统
- 模块化架构
- 面向对象 + 函数式 + 响应式编程
- 类似 Angular 的设计风格

DTO = Data Transfer Object
DDL = Data Definition Language

官网：https://nestjs.com

---

# 2. 环境安装

## 安装 CLI

```bash
npm install -g @nestjs/cli
```

## 创建项目

```bash
nest new nest-demo
```

## 启动项目

```bash
npm run start:dev
```

---

# 3. Nest 核心架构概念

Nest 的核心构建块：

- Module
- Controller
- Provider

---

## 3.1 Module（模块）

模块用于组织应用结构。

```ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

### 作用

- 组织代码结构
- 管理依赖
- 封装功能

---

## 3.2 Controller（控制器）

负责处理 HTTP 请求。

```ts
import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get()
  findAll() {
    return '返回所有用户';
  }
}
```

访问地址：

    GET /users

---

## 3.3 Provider（服务）

负责业务逻辑。

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  findAll() {
    return ['Tom', 'Jack'];
  }
}
```

---

## 3.4 Dependency Injection（依赖注入）

Nest 使用构造函数注入：

```ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
```

优点：

- 解耦
- 可测试
- 可扩展

---

# 4. 生命周期

生命周期接口：

```ts
OnModuleInit;
OnApplicationBootstrap;
OnModuleDestroy;
```

示例：

```ts
import { OnModuleInit } from '@nestjs/common';

export class UserService implements OnModuleInit {
  onModuleInit() {
    console.log('模块初始化完成');
  }
}
```

### 🔥 Nest 启动核心流程图

```ts
bootstrap()
   │
   ▼
NestFactory.create()
   │
   ▼
创建 NestContainer（容器）
   │
   ▼
扫描模块 (DependenciesScanner)
   │
   ▼
注册所有 Module
   │
   ▼
注册所有 Provider
   │
   ▼
实例化 Provider (InstanceLoader)
   │
   ▼
执行 constructor()
   │
   ▼
执行 onModuleInit() //触发时机：当前模块里的 provider 实例创建完成后执行，当前这个 provider 实例创建完成后”就会执行它自己的 onModuleInit
   │
   ▼
执行 onApplicationBootstrap()
   │
   ▼
app.listen()
   │
   ▼
启动 HTTP Server (Express / Fastify)
   │
   ▼
开始接收请求

```

### 真正执行顺序（非常关键 🔥）

```ts
遍历 module A
  实例化 module A 的 providers
  执行 module A 的 onModuleInit()

遍历 module B
  实例化 module B 的 providers
  执行 module B 的 onModuleInit()

全部模块完成
  执行 onApplicationBootstrap()
```

---

# 5. 中间件（Middleware）

用于请求前处理，如日志记录、请求解析等。

## 5.1 Express 适配器中间件（标准方式）

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}
```

在模块中注册：

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 应用到所有路由
  }
}
```

## 5.2 Fastify 适配器中间件（重要！）

> ⚠️ **注意**：本项目使用 Fastify 作为 HTTP 适配器。Fastify 3.0+ 不再支持 Express 风格的中间件！

### 为什么 Express 中间件在 Fastify 中不工作？

- Express 中间件使用 `(req, res, next)` 签名
- Fastify 使用自己的请求/响应对象，与 Express 不兼容
- Fastify 3.0+ 移除了 `middie` 中间件兼容层

### Fastify 中间件的正确使用方式

#### 方式 1：使用 Fastify Hooks（推荐）

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 使用 Fastify 原生 Hook
  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.addHook('onRequest', async (request, reply) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  });

  await app.listen(3000);
}
```

#### 方式 2：使用 NestJS 拦截器替代中间件

对于大多数场景，使用**拦截器**比中间件更合适：

```ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    console.log(`[请求] ${method} ${url}`);

    return next
      .handle()
      .pipe(tap(() => console.log(`[响应] ${method} ${url} - ${Date.now() - now}ms`)));
  }
}
```

#### 方式 3：使用 @middie/middie 插件（兼容 Express 中间件）

如果必须使用 Express 风格的中间件：

```bash
pnpm add @fastify/middie
```

```ts
// main.ts
import middie from '@fastify/middie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // 注册 middie 插件
  await app.register(middie);

  // 现在可以使用 Express 风格的中间件
  app.use((req, res, next) => {
    console.log('Express-style middleware');
    next();
  });

  await app.listen(3000);
}
```

### Fastify Hooks 对照表

| Hook               | 触发时机       | 用途           |
| ------------------ | -------------- | -------------- |
| `onRequest`        | 请求开始时     | 日志、认证检查 |
| `preParsing`       | 解析请求体之前 | 修改请求体     |
| `preValidation`    | 验证之前       | 自定义验证     |
| `preHandler`       | 处理器执行之前 | 权限检查       |
| `preSerialization` | 序列化响应之前 | 修改响应数据   |
| `onSend`           | 发送响应之前   | 添加响应头     |
| `onResponse`       | 响应发送之后   | 日志、清理     |
| `onError`          | 发生错误时     | 错误处理       |

---

# 6. 管道（Pipes）

管道用于**数据转换**和**数据验证**，在 Controller 方法执行之前处理输入数据。

## 6.1 管道的作用

| 功能     | 说明                     | 示例          |
| -------- | ------------------------ | ------------- |
| **转换** | 将输入数据转换为目标类型 | 字符串 → 数字 |
| **验证** | 验证输入数据是否符合规则 | 邮箱格式检查  |

## 6.2 使用场景

### 场景 1：参数类型转换

URL 参数默认是字符串，需要转换为数字：

```ts
// ❌ 没有管道：id 是 string 类型
@Get(':id')
findOne(@Param('id') id: string) {
  return typeof id; // "string"
}

// ✅ 使用 ParseIntPipe：id 自动转换为 number
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return typeof id; // "number"
}
```

### 场景 2：DTO 数据验证

验证客户端提交的数据：

```ts
// create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: '名称至少2个字符' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}

// user.controller.ts
@Post()
create(@Body() createUserDto: CreateUserDto) {
  // 如果验证失败，自动返回 400 错误
  // 验证通过才会执行到这里
  return this.userService.create(createUserDto);
}
```

### 场景 3：可选参数与默认值

```ts
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';

@Get()
findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
) {
  return { page, limit }; // 如果没传参数，使用默认值
}
```

### 场景 4：UUID 验证

```ts
import { ParseUUIDPipe } from '@nestjs/common';

@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  // 只有合法的 UUID 才能进入这里
  // 非法 UUID 自动返回 400 错误
  return this.userService.findOne(id);
}
```

## 6.3 内置管道

| 管道               | 用途            |
| ------------------ | --------------- |
| `ParseIntPipe`     | 字符串 → 整数   |
| `ParseFloatPipe`   | 字符串 → 浮点数 |
| `ParseBoolPipe`    | 字符串 → 布尔值 |
| `ParseArrayPipe`   | 字符串 → 数组   |
| `ParseUUIDPipe`    | 验证 UUID 格式  |
| `ParseEnumPipe`    | 验证枚举值      |
| `DefaultValuePipe` | 提供默认值      |
| `ValidationPipe`   | DTO 类验证      |

## 6.4 自定义管道

```ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new BadRequestException('必须是正整数');
    }
    return num;
  }
}

// 使用
@Get(':id')
findOne(@Param('id', ParsePositiveIntPipe) id: number) {
  return id;
}
```

## 6.5 全局管道

在 `main.ts` 中注册：

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // 自动剔除 DTO 中未定义的属性 客户端传了 {name: "Tom", hack: "xxx"}，如果 DTO 只定义了 name，则 hack 会被自动移除
    transform: true, // 自动类型转换 @Query('id') id: number 会自动把字符串 "123" 转成数字 123
    forbidNonWhitelisted: true, // 存在未定义属性时报错 比 whitelist 更严格，不只是剔除，而是拒绝请求
  })
);
```

---

# 7. 守卫（Guards）

守卫用于**权限控制**，决定请求是否应该被处理。

## 7.1 守卫的作用

- 在 Controller 方法执行**之前**运行
- 返回 `true` → 允许访问
- 返回 `false` 或抛出异常 → 拒绝访问

### 核心概念

- CanActivate 是 守卫（Guard）的接口。用来判断请求是否继续执行
- ExecutionContext 当前请求上下文（request，response，handler当前方法，class当前控制器，当前运行平台）
- Reflector - 读取装饰器元数据（你用 @SetMetadata() 定义的元数据）

## 7.2 使用场景

### 场景 1：JWT 认证守卫

检查用户是否已登录：

```ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    try {
      // 验证 JWT（示例，实际需要使用 jwt 库）
      const payload = this.verifyToken(token);
      request.user = payload; // 将用户信息挂载到请求对象
      return true;
    } catch {
      throw new UnauthorizedException('认证令牌无效');
    }
  }

  private verifyToken(token: string) {
    // JWT 验证逻辑
    return { userId: 1, email: 'user@example.com' };
  }
}
```

使用守卫：

```ts
@Controller('users')
@UseGuards(JwtAuthGuard) // 整个控制器都需要认证
export class UserController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // 从守卫中获取的用户信息
  }
}
```

### 场景 2：角色权限守卫

检查用户是否有特定角色：

```ts
// roles.decorator.ts - 自定义装饰器
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// roles.guard.ts - 角色守卫
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由上定义的角色要求
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // 没有角色要求，允许访问
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户角色是否匹配
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

使用：

```ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('dashboard')
  @Roles('admin') // 只有 admin 角色可以访问
  getDashboard() {
    return { message: '欢迎管理员' };
  }

  @Get('reports')
  @Roles('admin', 'manager') // admin 或 manager 可以访问
  getReports() {
    return { message: '报表数据' };
  }
}
```

### 场景 3：API Key 守卫

验证 API 密钥：

```ts
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('无效的 API Key');
    }

    return true;
  }
}
```

### 场景 4：公开路由跳过守卫

```ts
// public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 检查是否标记为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // 公开路由，跳过认证
    }

    // 正常的认证逻辑...
    return this.validateToken(context);
  }
}
```

使用：

```ts
@Controller('auth')
export class AuthController {
  @Public() // 标记为公开路由
  @Post('login')
  login() {
    return { token: 'xxx' };
  }

  @Public()
  @Post('register')
  register() {
    return { message: '注册成功' };
  }
}
```

## 7.3 守卫执行顺序

```
请求 → 中间件 → 守卫 → 拦截器(前) → 管道 → Controller → 拦截器(后) → 响应
```

## 7.4 全局守卫

```ts
// main.ts
app.useGlobalGuards(new JwtAuthGuard());

// 或在模块中注册（支持依赖注入）
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

## 7.5 管道 vs 守卫 对比

| 特性         | 管道 (Pipe)               | 守卫 (Guard)         |
| ------------ | ------------------------- | -------------------- |
| **主要用途** | 数据转换和验证            | 权限控制             |
| **执行时机** | 守卫之后，Controller 之前 | 中间件之后，管道之前 |
| **返回值**   | 转换后的数据              | boolean              |
| **典型场景** | 参数类型转换、DTO 验证    | JWT 认证、角色检查   |

---

# 8. 拦截器（Interceptors）

用于请求/响应转换。

```ts
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
```

---

# 9. 异常过滤器（Exception Filters）

```ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
```

---

# 10. DTO 与数据验证

安装依赖：

```bash
npm install class-validator class-transformer
```

DTO 示例：

```ts
import { IsString, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;
}
```

启用全局验证：

```ts
app.useGlobalPipes(new ValidationPipe());
```

---

# 11. 数据库示例（TypeORM）

安装：

```bash
npm install @nestjs/typeorm typeorm mysql2
```

配置：

```ts
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'test',
  entities: [],
  synchronize: true,
});
```

---

# 12. 实战示例：用户管理 API

### user.entity.ts

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

### user.service.ts

```ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  findAll() {
    return this.userRepo.find();
  }
}
```

---

# 13. 总结

Nest 核心架构：

- Module：结构
- Controller：路由
- Provider：逻辑
- DI：依赖管理
- Middleware / Guard / Pipe / Interceptor：请求生命周期控制

适合：

- 企业级后端
- 微服务架构
- 大型项目

---

📌 建议学习路径：

1.  理解 DI （依赖注入）原理
2.  熟悉生命周期
3.  掌握验证和异常处理
4.  结合数据库实战
5.  了解微服务模式

---

作者：自动生成教程
