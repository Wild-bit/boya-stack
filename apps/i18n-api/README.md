# i18n-api

多语言国际化后端服务，基于 NestJS + Fastify + Prisma 7 构建。

## 技术栈

| 技术       | 版本 | 用途        |
| ---------- | ---- | ----------- |
| NestJS     | 11.x | 后端框架    |
| Fastify    | 5.x  | HTTP 适配器 |
| Prisma     | 7.x  | ORM         |
| PostgreSQL | -    | 数据库      |
| TypeScript | 5.x  | 开发语言    |
| SWC        | -    | 快速编译    |

## 项目结构

```
apps/i18n-api/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   └── migrations/        # 数据库迁移文件
├── src/
│   ├── common/            # 公共模块
│   │   ├── constants/     # 常量定义
│   │   ├── dto/           # 通用 DTO
│   │   ├── filters/       # 异常过滤器
│   │   ├── interceptors/  # 拦截器
│   │   └── types/         # 类型定义
│   ├── config/            # 配置模块
│   ├── generated/         # Prisma 生成的客户端（自动生成）
│   ├── modules/           # 业务模块
│   │   └── health/        # 健康检查模块
│   ├── prisma/            # Prisma 服务模块
│   ├── app.module.ts      # 根模块
│   └── main.ts            # 入口文件
├── .env                   # 环境变量（不提交到 Git）
├── prisma.config.ts       # Prisma CLI 配置
├── tsconfig.json          # TypeScript 配置
└── package.json
```

## 环境要求

- Node.js >= 22.12.0
- pnpm >= 9.x
- PostgreSQL >= 14

## 快速开始

### 1. 安装依赖

在项目根目录运行：

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量模板并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DATABASE_URL=postgresql://用户名:密码@localhost:5432/数据库名
API_PREFIX=/api
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 3. 生成 Prisma Client

```bash
pnpm db:generate
```

### 4. 初始化数据库

推送 schema 到数据库（开发环境）：

```bash
pnpm db:push
```

或使用迁移（生产环境）：

```bash
pnpm db:migrate
```

### 5. 启动开发服务器

```bash
pnpm dev
```

服务将运行在 `http://localhost:4000/api`

## 可用命令

| 命令              | 说明                     |
| ----------------- | ------------------------ |
| `pnpm dev`        | 启动开发服务器（热重载） |
| `pnpm build`      | 构建生产版本             |
| `pnpm start`      | 启动服务                 |
| `pnpm start:prod` | 启动生产版本             |
| `pnpm lint`       | 运行 ESLint 检查         |
| `pnpm typecheck`  | TypeScript 类型检查      |
| `pnpm clean`      | 清理构建产物             |

### 数据库命令

| 命令               | 说明                           |
| ------------------ | ------------------------------ |
| `pnpm db:generate` | 生成 Prisma Client             |
| `pnpm db:migrate`  | 运行数据库迁移                 |
| `pnpm db:push`     | 推送 schema 到数据库（开发用） |
| `pnpm db:studio`   | 打开 Prisma Studio             |

## API 端点

### 健康检查

```
GET /api/health
```

响应示例：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-14T10:00:00.000Z",
    "database": "healthy"
  }
}
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE",
  "errors": { ... }  // 可选，验证错误详情
}
```

## 开发指南

### 添加新模块

使用 NestJS CLI 生成模块：

```bash
nest g module modules/模块名
nest g controller modules/模块名
nest g service modules/模块名
```

### 添加数据库模型

1. 编辑 `prisma/schema.prisma`
2. 运行 `pnpm db:generate` 生成客户端
3. 运行 `pnpm db:push` 或 `pnpm db:migrate` 同步数据库

### 模块导入

项目使用 CommonJS 模式，导入时无需添加扩展名：

```ts
import { SomeService } from './some.service';
```

## 故障排除

### Prisma generate 失败

确保 `.env` 文件存在且包含 `DATABASE_URL`：

```bash
cat .env | grep DATABASE_URL
```

### 数据库连接失败

检查 PostgreSQL 是否运行：

```bash
pg_isready -h localhost -p 5432
```
