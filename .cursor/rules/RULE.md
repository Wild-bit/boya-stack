---
alwaysApply: true
description: '本规则为前端和后端的业务开发提供了标准'
---

# 项目规则（Project Rules）— Fullstack Monorepo

你正在一个 **生产级全栈 Monorepo 项目** 中工作。
所有代码、架构设计、技术选型 **必须严格遵守以下规则**。

---

## 一、通用规则（最高优先级）

- 全项目 **必须使用 TypeScript**
- 开启 TypeScript `strict` 模式
- 不得引入未声明的技术栈或第三方方案
- 优先保证 **可维护性、可读性、长期演进能力**
- 不得随意改变既有架构或分层
- 假设该项目会被 **多人长期维护**

---

## 二、Monorepo 规则

- 本项目采用 **Monorepo 架构**
- 前端、后端、共享代码必须 **物理隔离**
- 禁止跨层、跨应用直接依赖

### 推荐结构（概念性）

- `apps/i18n-web`：前端应用（React）
- `apps/i18n-api`：后端服务（NestJS）
- `packages/shared`：共享代码（types / zod schema / 常量）

### 强制规则

- ❌ 前端不得直接引用后端代码
- ❌ 后端不得引用前端代码
- ✅ 仅允许通过 `packages/shared` 共享类型或 schema
- 共享代码必须 **与具体框架无关**
- 严禁循环依赖

---

## 三、前端规则（React）

### 技术栈（严格限制）

- React + Vite
- TypeScript
- react-hook-form
- zod
- zustand
- SWR
- TailwindCSS
- Ant Design

❌ 禁止使用：

- Redux / MobX
- React Query
- styled-components / emotion
- 其他 CSS 框架

---

### 前端架构约束

- **表单**
  - 必须使用 `react-hook-form`
  - 表单校验必须使用 `zod`
  - 校验规则需集中管理

- **状态管理**
  - `zustand` 仅用于真正的全局状态
  - 页面级状态使用 React 本地状态

- **数据请求**
  - 所有接口请求必须通过统一 `services/`（service 层）调用，禁止在组件/页面中直接写 fetch
  - 前端请求必须使用：`fetch + 一个轻量 wrapper + SWR`
    - ❌ 禁止使用 axios
    - ❌ 禁止使用 React Query
  - 服务端数据（Server State）必须由 `SWR` 管理：
    - 列表/详情等读接口：统一走 `useSWR`
    - 写接口（POST/PUT/PATCH/DELETE）：统一走 service 层 + `mutate` 做乐观更新/刷新
  - 必须提供统一的请求封装能力（wrapper），至少包含：
    - baseUrl / headers（含 token）
    - JSON 序列化/反序列化
    - 统一错误结构（含 status / message / code）
    - 超时与取消（如使用 AbortController）
    - 拦截器（interceptors）

- **UI 规范**
  - 组件优先使用 Ant Design
  - TailwindCSS 用于布局、间距和细节样式
  - 禁止在业务中混乱自定义样式方案

---

### 前端目录语义（约定）

- `components/`：通用 UI 组件
- `modules/`：按业务划分的功能模块
- `hooks/`：可复用 hooks
- `stores/`：zustand 全局状态
- `services/`：API 请求封装
- `schemas/`：zod 校验规则
- `env/`: 项目的环境变量

---

## 四、后端规则（NestJS）

### 技术栈（严格限制）

- Node.js
- TypeScript
- NestJS
- **Fastify 作为 HTTP Adapter**
- Prisma
- PostgreSQL

❌ 禁止使用：

- Express
- TypeORM / Sequelize
- MongoDB

---

### 后端架构约束

- 使用 **NestJS 模块化设计**
- 每个业务域必须包含：
  - `module`
  - `controller`
  - `service`
- 禁止在 Controller 中直接操作数据库
- 所有数据库访问必须通过 Prisma
- 所有请求必须经过参数校验
- 必须使用统一异常处理（Exception Filter）
- API 响应结构必须统一

---

## 五、API

- API 风格：**REST**
- 请求 / 响应结构必须一致
- 推荐使用 **zod 作为单一事实源**
- 前后端校验规则必须保持一致
- 后端不使用 `packages/shared`

---

## 六、代码质量与规范

- 文件职责单一，避免“巨型文件”
- 明确命名，避免缩写
- 注释解释 **为什么这样做**，而不是代码本身
- 严格遵守 ESLint / Prettier 规则

---

## 七、禁止行为（红线）

- ❌ 不得私自引入新技术栈
- ❌ 不得为了省事破坏架构
- ❌ 不得自动生成无关样板代码
- ❌ 不得在未说明的情况下重构整体结构
- ❌ 不得引入微服务（除非明确要求）

---

## 八、AI 行为约束（Cursor 专用）

在生成代码或方案前，你必须：

1. 理解当前项目结构
2. 遵循既有模式与规则
3. 优先进行 **小步、可控修改**
4. 只有在必要时才向用户提问

你是一名 **在真实生产项目中工作的高级工程师**，  
请以此标准约束你的所有输出。
All generated code must include comment: // CURSOR_RULE_ACTIVE.
