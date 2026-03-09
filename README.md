# Next Enterprise Starter

[🌐 English](README.en.md) | [🇨🇳 简体中文](README.md)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js" alt="Next.js 15.5">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT">
</p>

<p align="center">
  <b>企业级 Next.js 全栈启动模板</b><br>
  AI Native · 分层内核 + 垂直 Feature 切片 · 类型安全 · 生产就绪
</p>

---

## 为什么选择这个项目？

> 💡 **解决真实痛点**：从无数企业级项目的血泪教训中提炼，不只是 Demo，而是可直接投入生产的架构模板

- 🏗️ **清晰可扩展的分层架构** — Clean Architecture + ESLint 强约束，架构边界自动保障
- 🎯 **类型安全端到端** — 从数据库到 UI，一次修改全链路类型同步
- 🤖 **AI Native 设计** — 专为 AI Agent / LLM 优化的架构，AI 可精准理解和修改代码
- 🚀 **开发体验优先** — 命名自动转换、智能预取、一键开发环境
- 📊 **可观测性内置** — 结构化日志、错误分类、性能追踪开箱即用

---

## 🤖 AI Native 架构设计

本项目从设计之初就考虑 **AI Agent / LLM 友好性**，让 AI 能够精准理解代码结构、自主完成复杂修改：

### 1. 显式架构约束（Architecture as Code）

依赖规则不是文档里的建议，而是**可执行的代码**：

```javascript
// eslint.config.js —— AI 可直接解析的架构规则
'boundaries/element-types': ['error', {
  rules: [
    { from: 'L0_Primitives', disallow: ['L1_Infra', 'L2_UI_State', 'L3_Features'] },
    { from: 'L1_Infra', disallow: ['L2_UI_State', 'L3_Features'] },
    { from: 'L2_UI_State', disallow: ['L3_Features'] },
  ]
}]
```

**对 AI 的价值**：
- LLM 读取 AGENTS.md 即可精确理解分层边界
- 修改代码时 ESLint 会阻止越层调用，AI 可自检修正
- 无需理解整个项目，只需关注当前层和允许的依赖层

### 2. 结构化项目元数据（AGENTS.md）

专供 AI 读取的项目规范文档，包含：

| 章节 | 内容 | AI 用途 |
|------|------|---------|
| `<project_meta>` | 技术栈、URL、常用命令 | 上下文初始化 |
| `<architecture_blueprint>` | L0-L4 层级定义、依赖矩阵 | 代码定位决策 |
| `<implementation_guide>` | 命名规范、错误处理、类型安全 | 代码生成约束 |
| `<testing_strategy>` | 测试策略、文件命名 | 测试生成指导 |
| `<quality_gates>` | 完成定义、检查清单 | 任务完成验证 |

**对 AI 的价值**：
- 一次性获取项目全景，减少反复检索
- 明确的决策规则，降低幻觉概率
- 标准化的工作流（Analyze → Design → Review → Plan → Implement → Verify）

### 3. 垂直切片降低认知负担

每个 Feature 是一个**自包含的上下文窗口**：

```
features/todos/
├── domain/todo.model.ts          # AI 改这里 → 影响类型定义
├── application/create-todo.usecase.ts  # AI 改这里 → 影响业务逻辑
├── infrastructure/todo.repository.ts   # AI 改这里 → 影响数据访问
├── api/todos.actions.ts          # AI 改这里 → 影响 API 接口
├── hooks/use-todos.ts            # AI 改这里 → 影响前端状态
└── ui/todo-list.tsx              # AI 改这里 → 影响 UI 展示
```

**对 AI 的价值**：
- 修改范围可预测，不会意外影响其他 Feature
- 每层职责单一，AI 生成的代码更符合规范
- 通过 `mod.ts` 显式导出，AI 知道哪些可以依赖

### 4. 类型即文档（Zod Schema 驱动）

领域模型使用 Zod 定义，AI 可同时理解**运行时验证**和**静态类型**：

```typescript
// AI 读取这一行，同时知道：
// 1. 运行时验证规则（Zod）
// 2. TypeScript 类型（z.infer）
// 3. 字段约束（min/max/email 等）
export const UserSchema = z.object({
  id: z.string().ulid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  role: z.enum(['admin', 'user']),
})
export type User = z.infer<typeof UserSchema>
```

**AGENTS.md 中的精确类型定义**：

```typescript
// 类型系统贯穿全链路 —— 从 Domain 到 UI
Domain:Todo → Application:UseCase → Infrastructure:Repository → API:Action → UI:Component
     ↑              ↑                      ↑                   ↑              ↑
   Zod Schema    输入校验              数据映射            请求验证       表单类型
```

**对 AI 的价值**：
- 无需阅读注释即可理解数据约束
- **类型变更自动传播**：修改 Zod Schema → 类型推导更新 → 全链路类型检查 → AI 可追踪影响范围自动修复问题
- 生成测试数据时可直接使用 Zod 约束

### 5. Result 类型消除异常控制流

业务错误显式返回，AI 可以**静态分析所有代码路径**：

```typescript
// AI 能确定：这个函数只有两种结果，不会抛出异常
async function createTodo(input: unknown): Promise<Result<Todo, TodoError>> {
  const parsed = TodoSchema.safeParse(input)
  if (!parsed.success) {
    return err(new ValidationError(parsed.error))
  }
  // ... 不会意外抛出，AI 无需考虑 try-catch
  return ok(todo)
}

// 调用点清晰明确
const result = await createTodo(input)
if (!result.ok) {
  // AI 知道这里处理错误，不会遗漏
  return handleError(result.error)
}
// AI 知道这里 result.value 一定存在
return result.value
```

**对 AI 的价值**：
- 控制流显式化，AI 不会遗漏错误处理分支
- 无需分析异常传播路径，降低推理复杂度
- 错误类型结构化，AI 可生成精准的错误提示

### 6. 命名自动转换减少认知噪音

AI 无需处理 `snake_case` vs `camelCase` 的映射：

```typescript
// AI 读写都是 camelCase，无需记忆数据库字段名
const todo = await supabase
  .from('todos')
  .insert({ title, userId, isPublic })  // AI 写 camelCase
  .select('id, title, userId, createdAt')  // AI 选 camelCase
  .single()

// 返回的 todo 也是 camelCase，AI 可直接使用
todo.createdAt  // 不是 todo.created_at
```

**对 AI 的价值**：
- 一致的命名风格，减少 token 消耗
- 无需维护两套命名的心智模型
- 类型生成也是 camelCase，类型检查更直观

## 核心亮点

### 🏛️ 分层内核 + 垂直 Feature 切片

独创的**混合架构模式**，既有 Clean Architecture 的清晰分层，又有 Feature-Based 的高内聚：

```
┌─────────────────────────────────────────────────┐
│  L4 - App Shell (路由、布局、Provider)            │
├─────────────────────────────────────────────────┤
│  L3 - Features (垂直业务切片，纵贯四层)           │
│     ┌──────────────────────────────────────┐   │
│     │  Domain → Application → Infra → UI   │   │
│     └──────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  L2 - Presentation (共享 UI/Hooks/Context)      │
├─────────────────────────────────────────────────┤
│  L1 - Infrastructure (Supabase/tRPC/Logger)     │
├─────────────────────────────────────────────────┤
│  L0 - Shared Kernel (Result、Errors、Utils)     │
└─────────────────────────────────────────────────┘
```

**依赖规则由 ESLint 强制保障** —— 低层无法导入高层，跨 Feature 只能通过 `mod.ts` 访问。

### 🔄 命名自动转换机制

数据库 `snake_case` ↔ 应用层 `camelCase` **全自动双向转换**，开发时无需思考：

```typescript
// 你的代码 —— 纯 camelCase
const { data } = await supabase
  .from('todos')
  .select('id, title, userId, createdAt')
  .eq('userId', userId)

// 实际请求 —— 自动转为 snake_case
// SELECT id, title, user_id, created_at FROM todos WHERE user_id = ?

// 响应 —— 自动转回 camelCase
console.log(data[0].createdAt) // ✓ 直接使用
```

类型声明也同步转换：`pnpm db:types:local` 生成的类型全是 camelCase。

### 🛡️ Result 类型与统一错误处理

告别 `try-catch` 地狱，业务错误显式表达：

```typescript
// Domain / Application 层
async function createTodo(input: TodoInput): Promise<Result<Todo, TodoError>> {
  if (input.title.length < 3) {
    return err(new TodoError({ code: 'TITLE_TOO_SHORT', userMessage: '标题至少需要3个字符' }))
  }
  // ... 持久化
  return ok(todo)
}

// UI 层
const result = await createTodo(input)
if (!result.ok) {
  toast.error(result.error.userMessage) // 用户友好错误提示
  return
}
setTodos(prev => [...prev, result.value]) // 类型安全的数据访问
```

**错误自动分类**：网络错误、认证失败、权限不足、数据冲突...每种错误都有标准化的处理策略。

### ⚡ 智能预取系统

基于 TanStack Query 的预取封装，支持 Hover 触发、自动触发、手动触发：

```typescript
const { prefetch } = usePrefetch({
  key: ['todos', userId],
  task: () => fetchTodos(userId),
  staleTime: 5 * 60 * 1000, // 5分钟新鲜度
})

// Hover 时自动预取（延迟 200ms 防抖动）
<Link href="/todos" onMouseEnter={prefetch}>
```

### 🔍 可观测性内置

- **结构化日志**：Pino + 请求追踪 ID，开发/生产一致
- **tRPC 中间件**：自动记录请求耗时、输入输出、错误分类
- **错误追踪**：Supabase/tRPC/自定义错误统一适配，上下文自动注入

### 🤖 AI 向量嵌入支持

内置 Embedding Service 接口，支持 SiliconFlow/OpenAI，轻松实现语义搜索：

```typescript
const embedding = await embeddingService.generateEmbedding({
  text: "用户查询内容",
  model: "BAAI/bge-m3"
})
// 返回 1024 维向量，可直接存入 PostgreSQL pgvector
```

### 📦 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 15.5 (App Router) / React 19 |
| **语言** | TypeScript 5.9 (严格模式) |
| **样式** | Tailwind CSS 4 / shadcn/ui |
| **状态** | Zustand / TanStack Query |
| **后端** | Supabase (PostgreSQL + Auth + RLS) |
| **API** | tRPC 11 / Server Actions |
| **验证** | Zod 4 |
| **测试** | Vitest + React Testing Library |
| **工具** | pnpm / ESLint / Husky |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/next-enterprise-starter.git
cd next-enterprise-starter
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 配置。本地开发所需的环境变量：

| 变量 | 说明 | 获取方式 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API 地址（通过 Caddy 代理） | 本地开发固定为 `https://localhost:44321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名访问密钥 | `pnpm db:start` 输出中获取 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务角色密钥（服务端使用） | `pnpm db:start` 输出中获取 |
| `SUPABASE_INTERNAL_URL` | Supabase 内部地址（绕过 Caddy） | 本地开发固定为 `http://127.0.0.1:54321` |

> **提示**：运行 `pnpm db:start` 后，终端会输出 `anon key` 和 `service_role key`，复制到 `.env.local` 即可。

### 4. 启动本地 Supabase

```bash
# 安装 Supabase CLI (如未安装)
# brew install supabase/tap/supabase

# 启动本地 Supabase
pnpm db:start

# 运行数据库迁移并生成类型
pnpm dev:prepare
```

### 5. 生成本地 HTTPS 证书（必需）

项目默认使用 HTTPS 开发，以兼容 Supabase 和第三方服务的混合内容策略。

```bash
# 安装 mkcert（如未安装）
brew install mkcert

# 安装本地 CA 到系统信任列表
mkcert -install

# 生成证书到 certs/ 目录
mkcert --cert-file certs/localhost+2.pem --key-file certs/localhost+2-key.pem localhost 127.0.0.1 ::1
```

> **注意**：证书文件不会提交到 Git，每个开发者需要本地生成。

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 https://localhost:3000

## Caddy 本地反向代理

项目使用 Caddy 作为本地反向代理，将 `https://localhost:44321` 转发到 Supabase 本地服务（`http://127.0.0.1:54321`），避免浏览器阻止混合内容。

`pnpm dev` 会自动启动 Caddy（如果未运行）。

### 安装 Caddy（如未安装）

```bash
# macOS
brew install caddy

# Linux
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sL https://get.caddyserver.com | sudo bash
```

> **注意**：Caddy 进程会在首次运行时自动申请证书，后续启动会复用。

## 项目结构

```
src/
├── app/                    # Next.js App Router（L4 - App Shell）
│   ├── _providers/         # 全局 Provider 组合
│   ├── api/trpc/           # tRPC API 路由
│   ├── dashboard/          # 仪表板页面
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   └── todos/              # 待办事项页面
├── features/               # L3 - 垂直业务切片
│   └── todos/              # 示例：纵贯四层的完整 Feature
│       ├── mod.ts          # 唯一公开入口（跨 Feature 访问接口）
│       ├── container.ts    # 轻量依赖注入
│       ├── domain/         # Domain 层：Zod Schema + 业务规则
│       ├── application/    # Application 层：UseCase + Ports
│       ├── infrastructure/ # Infrastructure 层：Repository 实现
│       ├── api/            # Interface Adapter：tRPC / Server Actions
│       ├── hooks/          # Presentation 层：数据获取 Hooks
│       └── ui/             # Presentation 层：Feature UI 组件
├── presentation/           # L2 - 共享表现层
│   ├── components/         # 业务组件
│   ├── hooks/              # 通用 React Hooks
│   ├── context/            # 共享 Context
│   └── schemas/            # 表单验证 Schemas
├── infra/                  # L1 - 基础设施
│   ├── supabase/           # Supabase 客户端 + 命名转换
│   ├── trpc/               # tRPC 配置 + 中间件
│   ├── prefetch/           # 智能预取系统
│   ├── errors/             # 错误分类 + 适配器
│   ├── observability/      # 结构化日志
│   └── ai/                 # AI Embedding 服务
├── shared/                 # L0 - Shared Kernel（零依赖）
│   ├── kernel/             # Result 类型、AppError
│   ├── domain/             # 跨 Feature 业务概念
│   ├── types/              # 自动生成的 camelCase DB 类型
│   └── utils/              # 纯工具函数
└── config/                 # 环境配置 + Feature Flags
```

## Feature 开发示例

一个完整的 Feature 纵贯四层，高内聚低耦合：

```typescript
// 1️⃣ Domain 层 —— 定义业务规则
// features/todos/domain/todo.model.ts
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.string().datetime(),
})
export type Todo = z.infer<typeof TodoSchema>

// 2️⃣ Application 层 —— 编排用例
// features/todos/application/usecases/create-todo.usecase.ts
export class CreateTodoUseCase {
  constructor(private todoRepo: TodoRepository) {}
  
  async execute(input: CreateTodoInput): Promise<Result<Todo, TodoError>> {
    const todo = Todo.create(input)
    if (todo.isErr()) return err(todo.error)
    
    return await this.todoRepo.save(todo.value)
  }
}

// 3️⃣ Infrastructure 层 —— 实现持久化
// features/todos/infrastructure/repositories/todo.repository.ts
export class SupabaseTodoRepository implements TodoRepository {
  async save(todo: Todo): Promise<Result<Todo, TodoError>> {
    const { data, error } = await supabase
      .from('todos')
      .insert(todo)
      .select()
      .single()
    
    if (error) return err(mapSupabaseError(error))
    return ok(data)
  }
}

// 4️⃣ API 层 —— 暴露接口
// features/todos/api/todos.actions.ts
'use server'
export async function createTodoAction(input: unknown) {
  const container = createTodoContainer()
  const result = await container.createTodoUseCase.execute(input)
  
  if (!result.ok) {
    return { success: false, error: result.error.userMessage }
  }
  return { success: true, data: result.value }
}

// 5️⃣ UI 层 —— 组件实现
// features/todos/ui/todo-list.tsx
'use client'
export function TodoList() {
  const { data: todos } = useTodos()
  const createTodo = useCreateTodo()
  
  return (
    <ul>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </ul>
  )
}
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (HTTPS) |
| `pnpm build` | 生产构建 |
| `pnpm lint` | ESLint 检查（含架构边界规则） |
| `pnpm type-check` | TypeScript 类型检查 |
| `pnpm test` | 运行测试（含覆盖率） |
| `pnpm verify` | 完整验证（secrets + lint + type-check + test + build） |
| `pnpm db:start` | 启动本地 Supabase |
| `pnpm db:reset` | 重置数据库 |
| `pnpm db:types:local` | 生成 camelCase 数据库类型 |
| `pnpm dev:prepare` | 一键初始化开发环境 |

## 架构原则

### 分层依赖矩阵

| 源 ↓ / 目标 → | L0 Kernel | L1 Infra | L2 Presentation | L3 Features |
|--------------|:---------:|:--------:|:---------------:|:-----------:|
| **L0 Kernel** | — | ❌ | ❌ | ❌ |
| **L1 Infra** | ✅ | — | ❌ | ❌ |
| **L2 Presentation** | ✅ | ⚪ | — | ❌ |
| **L3 Features** | ✅ | ✅ | ✅ | ⚪ |
| **L4 App** | ✅ | ✅ | ✅ | ✅ |

> ✅ 允许 | ❌ 禁止 | ⚪ 受限（可选/通过 mod.ts）

**ESLint 自动 enforcement**：违反依赖规则会直接报错。

### 关键设计决策

1. **垂直切片优先**：新功能按业务领域组织，而非技术类型
2. **显式依赖**：通过 `container.ts` 手动注入，便于测试和替换
3. **错误即类型**：业务错误用 `Result<T, E>` 表达，不抛异常
4. **类型驱动开发**：先定义 Zod Schema，再推导 TypeScript 类型

## 命名自动转换机制

项目实现了数据库字段命名（snake_case）与应用层命名（camelCase）的自动双向转换，覆盖运行时和类型声明两个层面，开发时无需手动处理。

### 1. 运行时自动转换

转换发生在 Supabase 客户端的请求/响应层面：

```
┌─────────────────────────────────────────────────────────────────┐
│                        你的代码 (camelCase)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 请求体 / URL 参数
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              createTransformingFetch (请求拦截)                   │
│  • 请求体: { userId: "xxx" } → { user_id: "xxx" }              │
│  • URL 参数: ?userId=xxx → ?user_id=xxx                        │
│  • Supabase 链式: .eq("userId", value) → .eq("user_id", value)  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase PostgREST API                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ 响应体
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              createTransformingFetch (响应拦截)                   │
│  • 响应体: { user_id: "xxx", created_at: "..." }                │
│         → { userId: "xxx", createdAt: "..." }                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        你的代码 (camelCase)                       │
└─────────────────────────────────────────────────────────────────┘
```

**核心实现：**

| 文件 | 职责 |
|------|------|
| `src/infra/utils/case-converter.ts` | 递归转换对象键名（camelCase ↔ snake_case） |
| `src/infra/supabase/transform-utils.ts` | 自定义 fetch，拦截请求/响应自动转换 |
| `src/infra/supabase/smart-url.ts` | 处理 Supabase 链式 API（`.eq()`, `.or()` 等） |

**使用示例：**

```typescript
// 应用层使用 camelCase
const { data, error } = await supabase
  .from('todos')
  .select('id, title, userId, createdAt')  // camelCase
  
// 响应自动转换为 camelCase
console.log(data[0].userId)    // ✓ "xxx"
console.log(data[0].createdAt) // ✓ "2024-01-01T00:00:00Z"

// 链式查询也支持 camelCase
const { data } = await supabase
  .from('todos')
  .eq('userId', userId)         // 自动转换为 user_id
  .or('status.eq.pending,and(status.eq.in_progress)") // 内部字段自动转换
```

### 2. 类型声明自动转换

数据库生成的类型文件（`lib/types/database.ts`）中的字段名也自动从 snake_case 转换为 camelCase，确保类型安全与代码一致。

**转换范围：**

- `Database.public.Tables.{table}.Row` - 表行类型
- `Database.public.Tables.{table}.Insert` - 插入类型
- `Database.public.Tables.{table}.Update` - 更新类型
- `Database.public.Views.{view}.Row` - 视图类型
- `Database.public.Functions.{func}.Args` - 函数参数类型
- `Database.public.Functions.{func}.Returns` - 函数返回类型
- `Database.public.Tables.{table}.Relationships[].columns` - 关系列名
- `Database.public.Tables.{table}.Relationships[].referencedColumns` - 引用的列名

**核心实现：**

| 文件 | 职责 |
|------|------|
| `scripts/db-type-transform.js` | TypeScript AST 转换器，将生成的类型文件中的 snake_case 属性名转换为 camelCase |
| `lib/types/database.source.ts` | 原始类型文件（Supabase CLI 生成） |
| `lib/types/database.ts` | 转换后的类型文件（camelCase） |

**工作流程：**

```
┌─────────────────────────────────────────────────────────────────┐
│              Supabase CLI (pnpm db:types:local)                 │
│  • 连接本地数据库                                                │
│  • 生成 database.source.ts (snake_case)                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              db-type-transform.js (AST 转换)                      │
│  • 解析 TypeScript AST                                           │
│  • 转换 Tables/Views/Functions 中的属性名                        │
│  • 输出 database.ts (camelCase)                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              应用层使用 camelCase 类型                            │
└─────────────────────────────────────────────────────────────────┘
```

**开发时如何处理：**

```typescript
// 直接使用 camelCase 类型，无需手动转换
import type { Database } from '@/shared/types'

type Todo = Database['public']['Tables']['todos']['Row']
// 转换为: { id: number; title: string; userId: string; createdAt: string; ... }

// 插入数据时也使用 camelCase
type TodoInsert = Database['public']['Tables']['todos']['Insert']
// 转换为: { title: string; userId?: string; ... }
```

### 注意事项

- **运行时转换**：对所有使用项目 Supabase 客户端（`server-client.ts` / `browser-client.ts`）的请求自动生效
- **类型声明转换**：运行 `pnpm db:types:local` 时自动触发，生成 camelCase 类型
- **认证请求**：Auth 相关的请求（`/auth/`）跳过运行时转换，保持 Supabase Auth 正常运作
- **直接 SQL**：使用 `.rpc()` 调用存储过程时，需要手动处理命名转换

## 谁适合使用这个项目？

| 场景 | 说明 |
|------|------|
| **AI 驱动开发团队** | 使用 Cursor/Copilot/Claude 等 AI 工具，需要 AI 友好的代码库 |
| **创业团队 MVP** | 跳过架构搭建，直接开始业务开发 |
| **企业级应用** | 需要长期维护、团队协作的大型项目 |
| **技术升级** | 从传统 MVC 迁移到现代分层架构 |
| **学习参考** | 理解 Clean Architecture 在 React 生态的实践 |

## 路线图

- [x] Clean Architecture 分层架构
- [x] **AI Native 架构设计** — AGENTS.md 规范、显式依赖约束
- [x] 命名自动转换机制
- [x] Result 类型与统一错误处理
- [x] 智能预取系统
- [x] AI Embedding 支持
- [ ] Realtime 实时订阅封装
- [ ] 文件上传/存储抽象
- [ ] 后台任务队列
- [ ] 多租户支持
- [ ] MCP (Model Context Protocol) 集成

## 贡献

欢迎 Issue 和 PR！请确保：

1. 代码通过 `pnpm verify`
2. 遵循现有架构分层
3. 新功能包含测试

## License

MIT © [Your Name]
