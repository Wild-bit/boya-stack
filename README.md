# My Monorepo Project

一个基于 **Monorepo 架构** 的全栈项目，前端使用 React，后端使用 NestJS。

## 📁 项目结构

```
my-monorepo-project/
├── apps/
│   ├── i18n-web/            # 前端应用 (React + Vite)
│   └── i18n-api/            # 后端服务 (NestJS + Fastify)
├── packages/
│   └── shared/              # 共享代码 (types / schemas / constants)
├── package.json             # 根目录配置
├── pnpm-workspace.yaml      # pnpm workspace 配置
└── tsconfig.json            # TypeScript 基础配置
```

## 🛠 技术栈

### 前端 (apps/i18n-web)

| 技术                  | 用途           |
| --------------------- | -------------- |
| React 19              | UI 框架        |
| Vite                  | 构建工具       |
| TypeScript            | 类型安全       |
| Ant Design            | UI 组件库      |
| TailwindCSS           | 原子化 CSS     |
| Zustand               | 状态管理       |
| SWR                   | 数据请求       |
| React Hook Form + Zod | 表单处理与校验 |

### 后端 (apps/i18n-api)

| 技术       | 用途         |
| ---------- | ------------ |
| NestJS     | 后端框架     |
| Fastify    | HTTP Adapter |
| Prisma     | ORM          |
| PostgreSQL | 数据库       |
| TypeScript | 类型安全     |
| Zod        | 数据校验     |

### 共享 (packages/shared)

- 类型定义 (`types/`)
- Zod Schema (`schemas/`)
- 常量 (`constants/`)

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
# 后端环境变量
cp apps/i18n-api/.env.example apps/i18n-api/.env
# 编辑 .env 文件，配置数据库连接

# 前端环境变量
cp apps/i18n-web/env.example apps/i18n-web/.env
# 编辑 .env 文件，配置 API 地址等（可选，已有默认值）
```

### 初始化数据库

```bash
# 生成 Prisma Client
pnpm --filter @app/i18n-api db:generate

# 同步数据库结构
pnpm --filter @app/i18n-api db:push
```

### 启动开发服务器

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:i18n-web  # 前端: http://localhost:3000
pnpm dev:i18n-api  # 后端: http://localhost:4000
# 验证端口是否释放
lsof -nP -iTCP:5433 -sTCP:LISTEN
```

## 📜 可用脚本

| 命令             | 描述                            |
| ---------------- | ------------------------------- |
| `pnpm dev`       | 同时启动前端和后端开发服务器    |
| `pnpm dev:web`   | 仅启动前端开发服务器            |
| `pnpm dev:api`   | 仅启动后端开发服务器            |
| `pnpm build`     | 构建所有应用                    |
| `pnpm lint`      | 运行 ESLint 检查                |
| `pnpm lint:fix`  | 运行 ESLint 并自动修复          |
| `pnpm format`    | 使用 Prettier 格式化代码        |
| `pnpm typecheck` | 运行 TypeScript 类型检查        |
| `pnpm clean`     | 清理所有构建产物和 node_modules |

## 📂 前端目录结构

```
apps/i18n-web/src/
├── components/          # 通用 UI 组件
│   └── layouts/         # 布局组件
├── modules/             # 业务模块
│   └── home/
│       └── pages/
├── hooks/               # 可复用 Hooks
├── stores/              # Zustand 全局状态
├── services/            # API 请求封装
├── schemas/             # Zod 校验规则
└── styles/              # 全局样式
```

## 📂 后端目录结构

```
apps/i18n-api/src/
├── common/              # 公共模块
│   ├── dto/             # 通用 DTO
│   ├── filters/         # 异常过滤器
│   └── interceptors/    # 拦截器
├── modules/             # 业务模块
│   └── health/          # 健康检查模块
├── prisma/              # Prisma 服务
├── app.module.ts        # 根模块
└── main.ts              # 入口文件
```

## 功能

### 1. 组织 & 项目结构（✅ 必做）

- Organization
- Team
- Project
- 项目支持多语言配置
- 默认语言（en）

### 2. 登录 & 成员体系

- 飞书 登录 （✅ 必做）
- 邀请成员（通过 email）（✅ 必做）
- 登录后自动绑定邀请（✅ 必做）
- 成员角色（Admin / Editor / Viewer）（✅ 必做）
- JWT 会话管理 双 token（Access + Refresh 双 token）实现（✅ 必做）

```js
1. 登录 → 发 access + refresh
2. access 过期 → 用 refresh 换新 access
3. 如果 refresh 被删除 → 强制下线
```

- 成员个人信息页（支持上传头像、展示、编辑 个性签名）🧠 可选加分（时间多再做）

### 3. Key & Translation 管理

- 新增 key（必填：namespace + key + source 文本；可选：描述）（✅ 必做）
- namespace 支持（✅ 必做）
- 搜索 key（✅ 必做）
- 表格展示（key、描述、对应翻译的语言（en、pt、id等）创建时间、更新时间）（✅ 必做）
- 多语言表格编辑（✅ 必做）
- AI 一键翻译 （展示原始语言（英文、中文等）、目标语言）（✅ 必做）
  - 占位符一致性校验 检测 {count} 等变量，不一致时标红提示（✅ 必做）

### 4. JSON 导入 / 导出

- 导入 JSON（source 或指定语言）（✅ 必做）
- 导出 JSON（指定语言）（✅ 必做）

### 5. 操作记录

- 记录 key 增删改（✅ 必做）
- 记录翻译修改（✅ 必做）

## 🔧 开发规范

1. **TypeScript**：全项目必须使用 TypeScript，开启 `strict` 模式
2. **代码分层**：严格遵守前后端分离，前端的共享代码放在 `packages/shared`
3. **数据请求**：前端使用 SWR + fetch wrapper，禁止使用 axios
4. **状态管理**：Zustand 仅用于真正的全局状态
5. **表单处理**：必须使用 React Hook Form + Zod
6. **API 响应**：后端使用统一的响应结构

## 📝 License

MIT
