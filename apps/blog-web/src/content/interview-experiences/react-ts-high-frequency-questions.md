# React + TypeScript 高频面试题深度解答

> 针对翼投科技「中高级前端工程师」岗位 | 7 道高概率面试题 | 结合项目实战

---

## 一、React Hooks 的闭包陷阱怎么解决？

### 什么是闭包陷阱？

闭包陷阱是指在 React Hooks 中，由于闭包特性，回调函数或异步操作捕获了**过时的 state/props 值**，导致行为不符合预期。

### 经典示例

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      // 闭包陷阱！count 永远是 0
      console.log('当前 count:', count)  // 始终输出 0
      setCount(count + 1)                // 始终设置为 1
    }, 1000)
    return () => clearInterval(timer)
  }, [])  // 空依赖 → 闭包捕获了初始值

  return <div>{count}</div>
}
```

**根本原因**：`useEffect` 的回调在组件首次渲染时创建，闭包捕获了当时 `count = 0` 的值。由于依赖数组为空，effect 不会重新执行，所以回调中的 `count` 永远是 `0`。

### 解决方案

**方案一：使用函数式更新（最常用）**

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    // 函数式更新，不依赖外部 count 值
    setCount(prev => prev + 1)
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

适用于：state 更新只依赖前一个值的场景。

**方案二：使用 useRef 保存最新值**

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  countRef.current = count  // 每次渲染都更新 ref

  useEffect(() => {
    const timer = setInterval(() => {
      // ref.current 永远是最新值
      console.log('当前 count:', countRef.current)
      setCount(countRef.current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return <div>{count}</div>
}
```

适用于：需要**读取**最新值但不想触发重新渲染，或在定时器/事件监听中获取最新 state。

**方案三：正确声明依赖**

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1)
  }, 1000)
  return () => clearInterval(timer)
}, [count])  // 每次 count 变化重新创建定时器
```

适用于：逻辑确实需要依赖该值，且重建副作用的成本可接受。

**方案四：useReducer 替代复杂 state 逻辑**

```tsx
function Counter() {
  const [count, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'increment': return state + 1
      case 'reset': return 0
      default: return state
    }
  }, 0)

  useEffect(() => {
    const timer = setInterval(() => {
      // dispatch 是稳定的引用，不会有闭包问题
      dispatch({ type: 'increment' })
    }, 1000)
    return () => clearInterval(timer)
  }, [])  // dispatch 不需要加入依赖

  return <div>{count}</div>
}
```

适用于：state 更新逻辑复杂、多个 state 之间有关联。

### 实际项目中的闭包陷阱场景

```tsx
// 我在 i18n 平台中遇到的实际场景：WebSocket 回调中获取最新翻译状态
function TranslationPanel() {
  const [translations, setTranslations] = useState<Translation[]>([])
  const translationsRef = useRef(translations)
  translationsRef.current = translations

  useEffect(() => {
    const ws = new WebSocket('ws://api/translations')
    ws.onmessage = (event) => {
      const newItem = JSON.parse(event.data)
      // 使用 ref 获取最新列表，避免闭包陷阱
      const updated = [...translationsRef.current, newItem]
      setTranslations(updated)
    }
    return () => ws.close()
  }, [])

  return <TranslationList data={translations} />
}
```

### 总结口诀

| 场景 | 推荐方案 |
|------|----------|
| state 只依赖前值 | `setState(prev => ...)` 函数式更新 |
| 定时器/监听器读最新值 | `useRef` 存最新值 |
| 逻辑确实依赖某 state | 正确声明依赖数组 |
| 复杂状态逻辑 | `useReducer` |

---

## 二、说说你项目中做过的性能优化

### 核心优化经验：H5 页面性能优化（点云科技）

#### 1. 分析阶段

使用 `webpack-bundle-analyzer` 分析打包产物，发现几个关键问题：

- 第三方库体积占比过大（vue、vue-router、SDK 等）
- 图片资源未做压缩和格式优化
- 未开启有效的压缩策略

#### 2. 优化策略与实施

**a) Externals + CDN 引入**

```js
// webpack.config.js
module.exports = {
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    axios: 'axios'
  }
}
```

```html
<!-- index.html 通过 CDN 引入，利用浏览器缓存 -->
<script src="https://cdn.example.com/vue@2.6.14/vue.min.js"></script>
```

**b) 代码分割与按需加载**

```js
// 路由级别懒加载
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')

// 组件级别按需加载
const HeavyChart = defineAsyncComponent(() => import('./components/HeavyChart.vue'))
```

**c) 图片 WebP 转换**

```js
// 构建前执行图片转换脚本
// 或直接使用已下载的 WebP 文件
// 配合 <picture> 标签做格式降级
```

**d) Gzip / Brotli 压缩**

```js
// 服务端配置 gzip 压缩
// Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

#### 3. 优化成果（关键数据）

| 指标 | 优化前 | 优化后 | 提升幅度 |
|------|--------|--------|----------|
| 包体积 | 81.78KB | 53.06KB | **↓35%** |
| FCP | 2.86s | 1.59s | **↓44%** |
| LCP | 3.15s | 1.79s | **↓43%** |

### PWA 缓存策略优化（起量加）

```ts
// 使用 Workbox 实现 Stale-While-Revalidate 策略
// 先返回缓存内容，后台静默更新
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,       // 最多缓存 60 个
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天过期
      }),
    ],
  })
)
```

**效果**：弱网/离线场景下页面依然可用，图片加载速度显著提升。

### React 项目性能优化实践

```tsx
// 1. React.memo 避免不必要的重渲染
const ExpensiveList = React.memo(({ items }: { items: Item[] }) => {
  return items.map(item => <ListItem key={item.id} data={item} />)
})

// 2. useMemo 缓存计算结果
const filteredData = useMemo(() => {
  return rawData.filter(item => item.status === activeFilter)
}, [rawData, activeFilter])

// 3. useCallback 稳定回调引用
const handleSearch = useCallback((keyword: string) => {
  fetchResults(keyword)
}, [fetchResults])

// 4. 虚拟列表处理大数据量
import { useVirtualizer } from '@tanstack/react-virtual'
```

### 面试话术建议

> "性能优化我觉得核心思路是三步：**先度量、再分析、后优化**。不能盲目优化，要用数据说话。我在之前项目中，通过 webpack-bundle-analyzer 定位到包体积瓶颈，再针对性地用 CDN externals、代码分割、图片 WebP 等方案逐步优化，最终包体积降了35%，FCP 和 LCP 分别降了44%和43%。"

---

## 三、TypeScript 中 type 和 interface 的区别？泛型怎么用的？

### type vs interface 核心区别

| 特性 | interface | type |
|------|-----------|------|
| 声明合并 | ✅ 支持（同名自动合并） | ❌ 不支持（同名报错） |
| extends 继承 | ✅ `interface B extends A` | ✅ `type B = A & { ... }` |
| 联合类型 | ❌ 不支持 | ✅ `type Status = 'active' \| 'inactive'` |
| 映射类型 | ❌ 不支持 | ✅ `type Readonly<T> = { readonly [K in keyof T]: T[K] }` |
| 类实现 | ✅ `class Foo implements IFoo` | ✅ 也可以 |
| 描述对象形状 | ✅ 最佳选择 | ✅ 可以 |
| 计算属性 | ❌ | ✅ 支持 |

### 选择建议

```ts
// 1. 定义对象结构 → 优先 interface（可扩展、可合并）
interface User {
  id: number
  name: string
  email: string
}

// 2. 联合类型、交叉类型、工具类型 → 必须用 type
type Status = 'pending' | 'active' | 'disabled'
type ApiResponse<T> = { code: number; data: T; message: string }

// 3. 声明合并场景 → 必须 interface（如扩展第三方库类型）
// 自动合并：给 Window 添加自定义属性
interface Window {
  __APP_CONFIG__: AppConfig
}
```

### 泛型的使用

**基础用法：函数泛型**

```ts
// 不用泛型：要么用 any 丢失类型，要么写多个重载
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0]
}

const num = getFirst([1, 2, 3])       // 自动推断为 number
const str = getFirst(['a', 'b', 'c']) // 自动推断为 string
```

**泛型约束**

```ts
// 约束 T 必须有 id 属性
interface HasId {
  id: number | string
}

function findById<T extends HasId>(list: T[], id: T['id']): T | undefined {
  return list.find(item => item.id === id)
}
```

**实际项目：类型安全的 HTTP 请求封装**

```ts
// 定义 API 响应结构
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 泛型请求函数
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  const result: ApiResponse<T> = await response.json()
  if (result.code !== 200) {
    throw new Error(result.message)
  }
  return result.data
}

// 使用时自动推断返回类型
interface UserInfo {
  id: number
  name: string
  role: string
}

const user = await request<UserInfo>('/api/user/1')
// user 自动推断为 UserInfo 类型，有完整的属性提示
```

**常用工具类型（高频考点）**

```ts
// Partial：所有属性变可选
type UpdateUser = Partial<User>  // { id?: number; name?: string; email?: string }

// Pick：选取部分属性
type UserBasic = Pick<User, 'id' | 'name'>  // { id: number; name: string }

// Omit：排除部分属性
type CreateUser = Omit<User, 'id'>  // { name: string; email: string }

// Record：构建键值对类型
type UserMap = Record<string, User>  // { [key: string]: User }

// ReturnType：获取函数返回值类型
type Result = ReturnType<typeof fetchUser>  // Promise<User>

// 实际场景：表单编辑用 Partial，创建用 Omit<T, 'id'>，列表用 Pick
```

**条件类型（进阶）**

```ts
// 根据条件推断类型
type IsString<T> = T extends string ? 'yes' : 'no'
type A = IsString<string>  // 'yes'
type B = IsString<number>  // 'no'

// 实际场景：API 返回值根据请求类型不同而不同
type ApiResult<T extends 'list' | 'detail'> =
  T extends 'list' ? User[] : User
```

---

## 四、你怎么设计一个前端权限系统？

### 权限系统设计分三层

```
┌──────────────────────────────────────┐
│           路由权限（页面级）            │  → 控制用户能看到哪些页面
├──────────────────────────────────────┤
│           组件权限（按钮级）            │  → 控制用户能操作哪些按钮
├──────────────────────────────────────┤
│           数据权限（接口级）            │  → 控制用户能看到哪些数据
└──────────────────────────────────────┘
```

### 第一层：路由权限

**方案：动态路由 + 路由守卫**

```tsx
// 1. 定义路由权限配置
interface RouteConfig {
  path: string
  component: React.LazyExoticComponent<any>
  roles: string[]  // 允许访问的角色
  children?: RouteConfig[]
}

const allRoutes: RouteConfig[] = [
  { path: '/dashboard', component: lazy(() => import('./pages/Dashboard')), roles: ['admin', 'editor'] },
  { path: '/users', component: lazy(() => import('./pages/Users')), roles: ['admin'] },
  { path: '/settings', component: lazy(() => import('./pages/Settings')), roles: ['admin'] },
]

// 2. 登录后根据用户角色过滤路由
function filterRoutes(routes: RouteConfig[], userRoles: string[]): RouteConfig[] {
  return routes.filter(route =>
    route.roles.some(role => userRoles.includes(role))
  )
}

// 3. 路由守卫组件
function AuthRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" />
  if (!roles.some(role => user.roles.includes(role))) return <Navigate to="/403" />

  return <>{children}</>
}
```

### 第二层：按钮/组件级权限

```tsx
// 权限指令组件
interface AuthProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

function Auth({ permission, children, fallback = null }: AuthProps) {
  const { permissions } = useAuth()

  if (!permissions.includes(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 使用
<Auth permission="user:delete">
  <Button danger onClick={handleDelete}>删除用户</Button>
</Auth>

<Auth permission="translation:export" fallback={<Tooltip title="无导出权限"><Button disabled>导出</Button></Tooltip>}>
  <Button onClick={handleExport}>导出翻译</Button>
</Auth>
```

### 第三层：数据权限（后端配合）

```tsx
// 前端请求拦截器：携带用户身份信息
axios.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 后端根据 token 中的角色信息，过滤返回数据
// 例如：普通成员只能看自己创建的翻译条目，管理员看全部
```

### 权限数据流设计

```
用户登录 → 获取 token → 请求用户信息（含角色、权限列表）
    ↓
存储到全局状态（Context / Zustand）
    ↓
路由层：动态生成可访问路由 + 菜单
    ↓
组件层：Auth 组件控制按钮显隐
    ↓
接口层：请求头带 token，后端鉴权
```

### 实际项目经验

> "在 i18n 国际化管理平台中，我设计了基于项目维度的权限控制：分为超级管理员、项目管理员、项目成员三个角色。路由层通过动态路由控制页面访问，组件层用权限指令控制增删改操作，数据层由后端根据角色过滤可见项目和翻译条目。"

---

## 五、Vite 为什么快？和 Webpack 的核心区别？

### 核心区别一览

| 维度 | Webpack | Vite |
|------|---------|------|
| 开发模式 | 全量打包后启动 dev server | 不打包，基于原生 ESM 按需加载 |
| 构建工具 | 自身（JS 编写） | esbuild 预构建 + Rollup 生产打包 |
| HMR 速度 | 与模块数量相关，项目越大越慢 | 只更新变更模块，与项目大小无关 |
| 冷启动 | 慢（需要构建整个依赖图） | 快（只预构建 node_modules） |
| 生产构建 | Webpack 自身打包 | Rollup 打包（tree-shaking 更好） |

### Vite 为什么快？三个核心原因

**1. 开发环境不打包，利用浏览器原生 ESM**

```
Webpack 模式：
  启动 → 分析所有依赖 → 打包全部模块 → 启动 dev server → 浏览器加载 bundle
  （项目越大，启动越慢）

Vite 模式：
  启动 → 立即启动 dev server → 浏览器请求模块 → Vite 按需编译返回
  （无论项目多大，启动都很快）
```

```ts
// 浏览器直接发起 ESM 请求
// <script type="module" src="/src/main.tsx"></script>
// 浏览器：GET /src/main.tsx
// Vite：实时编译 main.tsx → 返回 ESM 格式
// 浏览器遇到 import → 继续发请求 → 按需加载
```

**2. 依赖预构建使用 esbuild（Go 编写，比 JS 快 10-100 倍）**

```
node_modules 中的依赖：
  首次启动 → esbuild 预构建 → 转为 ESM → 缓存到 node_modules/.vite
  后续启动 → 直接使用缓存（几乎零成本）
```

esbuild 快的原因：
- Go 语言编写，编译为原生代码
- 多线程并行处理
- 从零编写，没有历史包袱

**3. HMR 精准更新**

```
Webpack HMR：模块变更 → 重新构建受影响的 chunk → 发送更新
Vite HMR：模块变更 → 只编译该模块 → 通过 ESM 精准替换
```

Vite 的 HMR 速度不会随项目增大而变慢，始终保持毫秒级。

### Vite 的缺点（面试加分点，展示全面思考）

1. **生产环境仍需打包**：浏览器大量 ESM 请求会导致瀑布流问题，所以生产用 Rollup 打包
2. **生态不如 Webpack 成熟**：某些老旧插件可能没有 Vite 版本
3. **开发和生产构建工具不同**：开发用 esbuild，生产用 Rollup，偶尔有行为不一致
4. **首次加载略慢**：首次请求需要编译，但有预构建缓存后就很快

### 面试话术

> "Vite 快的核心在于开发环境的架构差异。Webpack 采用先打包再启动的模式，随着项目增大启动会越来越慢。Vite 利用浏览器原生 ESM，启动时不做打包，按需编译，同时用 Go 编写的 esbuild 对 node_modules 做预构建，速度比 JS 工具快几十倍。在我现在的项目中，Webpack 冷启动需要十几秒，换 Vite 后基本1-2秒就能启动。"

---

## 六、你怎么用 AI 工具提升开发效率的？

> 这个问题 JD 明确提到了 Cursor 和 Trae，而且加分项有 AI Agent 产品开发经验，所以要重点准备。

### 我的 AI 工具使用体系

**1. Claude Code — 日常开发主力**

使用场景：
- **代码生成**：描述需求，直接生成组件/函数，再review调整
- **代码重构**：让 AI 分析现有代码，给出重构方案
- **调试辅助**：贴报错信息，快速定位问题根因
- **技术方案设计**：讨论架构选型，生成技术方案文档

实际案例：
```
场景：开发 i18n 平台的批量翻译功能
传统方式：手动写并发控制、错误重试、进度追踪 → 预估 2 天
AI 辅助：描述需求 → 生成核心逻辑 → 我 review 调整边界情况 → 半天完成
效率提升：约 4 倍
```

**2. 在具体开发场景中的应用**

```
a) 类型定义生成
   输入：API 文档或 JSON 示例
   输出：完整的 TypeScript 接口定义 + 请求函数

b) 单元测试编写
   输入：业务函数代码
   输出：覆盖主要场景的测试用例

c) 代码 Review
   输入：一段需要优化的代码
   输出：性能隐患、安全问题、可读性改进建议

d) 文档编写
   输入：组件/API 代码
   输出：使用文档 + 示例代码
```

**3. 使用原则（关键，展示专业态度）**

- **AI 生成 ≠ 直接使用**：所有 AI 生成的代码都要 review，理解后再集成
- **安全意识**：不把敏感信息（密钥、内部 API 地址）发给 AI
- **AI 擅长模式化工作**：CRUD、类型定义、测试用例、文档这类重复性工作提效最大
- **复杂业务逻辑仍需人工**：涉及复杂状态管理、性能优化策略、架构设计的决策，AI 是辅助而非替代

### 对 AI Agent 的理解（结合岗位需求）

> 翼投科技做的就是广告行业 AI Agent 应用，所以这块要有认知。

```
AI Agent 的核心特点：
1. 自主决策：根据目标拆解任务，自主选择工具和步骤
2. 工具调用：能调用外部 API、数据库、搜索引擎等
3. 记忆能力：保持上下文，支持多轮交互
4. 反馈循环：根据执行结果调整策略

在广告行业的应用场景：
- 智能投放：Agent 分析数据 → 自动调整出价和定向
- 素材生成：根据投放效果自动优化广告创意
- 报表分析：自然语言查询广告数据，生成分析报告
```

### 面试话术

> "我在日常开发中深度使用 Claude Code 等AI 工具，主要用在代码生成、重构、调试和技术方案讨论上。我的原则是让 AI 处理模式化的重复工作，比如类型定义、CRUD 代码、测试用例这些，人工专注在架构设计和业务逻辑上。实际体感效率提升大概在 2-4 倍。当然，AI 生成的代码一定要 review 后才能集成，不能盲目信任。"

---

## 七、说一个你项目中遇到的最复杂的问题，怎么解决的？

> 这题建议准备 2-3 个案例，根据面试氛围选择最合适的讲。

### 案例一：PWA 推送通知的兼容性与稳定性问题（推荐首选）

**背景**：
在起量加负责开发 PWA SDK 的推送通知能力，需要覆盖 Android 和 iOS 的主流浏览器。

**遇到的问题**：

1. **Service Worker 生命周期管理复杂**：安装、激活、更新的时序问题，用户刷新页面时可能有两个 SW 共存
2. **iOS Safari 对 PWA 支持差异**：Push API 在 iOS 16.4 之前完全不支持，且行为和 Android 差异大
3. **推送权限获取时机**：浏览器对 Notification 权限的限制越来越严格，不能在页面加载时直接弹授权窗

**解决过程**：

```
第一步：梳理问题 → 分类为三个独立问题，逐个击破
第二步：Service Worker 生命周期
  → 使用 Workbox 封装 SW 注册和更新逻辑
  → 实现 skipWaiting + clients.claim 策略
  → 添加版本检测和自动更新机制

第三步：跨平台兼容
  → 做能力检测而非 UA 判断
  → iOS 降级方案：不支持推送的用应用内通知替代
  → 封装统一 API，内部做平台适配

第四步：权限获取策略
  → 不在页面加载时直接请求权限
  → 在用户有明确意图时（如点击"开启通知"按钮）触发授权
  → 被拒绝后给出引导说明，不重复弹窗
```

**代码示例**：

```ts
// 统一推送能力封装
class PushManager {
  async requestPermission(): Promise<boolean> {
    // 能力检测
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('当前环境不支持推送通知')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async subscribe(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
    // 将订阅信息发送到后端存储
    await this.sendSubscriptionToServer(subscription)
    return subscription
  }
}
```

**最终成果**：
- 封装成 SDK，业务接入只需 3 行代码
- 支持 Android Chrome/Edge、iOS Safari 16.4+
- 推送到达率 95%+

### 案例二：i18n 平台批量翻译的并发控制

**背景**：i18n 平台支持一键翻译所有未翻译条目，可能有几百条需要调用 AI 翻译 API。

**问题**：
- 几百条同时请求 → API 限流导致大量失败
- 翻译过程中用户刷新/关闭页面 → 数据不一致
- 缺少进度反馈 → 用户不知道当前状态

**解决方案**：

```ts
// 并发控制器
async function batchTranslate(items: TranslationItem[], concurrency = 5) {
  const results: TranslationResult[] = []
  const queue = [...items]
  let completed = 0

  const worker = async () => {
    while (queue.length > 0) {
      const item = queue.shift()!
      try {
        const result = await translateWithRetry(item, { maxRetries: 3 })
        results.push({ ...item, translation: result, status: 'success' })
      } catch (error) {
        results.push({ ...item, status: 'failed', error: String(error) })
      }
      completed++
      onProgress?.(completed / items.length)  // 进度回调
    }
  }

  // 启动 N 个并发 worker
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return results
}
```

**关键设计**：
- 并发数限制为 5，避免触发 API 限流
- 单条失败自动重试 3 次，指数退避
- 实时进度条反馈
- 失败条目标记，支持重新翻译

### 面试话术

> "我会选 PWA 推送通知这个案例来讲。它复杂的点在于：第一是 Service Worker 的生命周期管理，要处理好安装、更新、多版本共存的问题；第二是跨平台兼容，iOS 和 Android 对 Push API 的支持差异很大；第三是权限获取策略，浏览器限制越来越严格。我的解决思路是先拆解问题，分层解决，最后封装成统一的 SDK，让业务方 3 行代码就能接入。"

---

## 面试通用建议

### STAR 法则回答项目问题

- **S（Situation）**：项目背景和业务场景
- **T（Task）**：你的职责和目标
- **A（Action）**：你采取的具体行动和技术方案
- **R（Result）**：最终成果和数据

### 不会的问题怎么办

1. 先说自己了解到的部分
2. 再说自己的思考方向
3. 最后坦诚表示这块还需要深入学习
4. **千万不要不懂装懂**

### 这个岗位的加分回答方向

- 多提 **React + TypeScript** 的实战经验
- 强调 **AI 工具** 的使用和理解
- 展示 **工程化思维**（不只是写业务代码，还关注基础设施）
- 体现 **B端产品** 的开发经验（权限、复杂表单、数据可视化）
