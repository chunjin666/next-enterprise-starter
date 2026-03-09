# Project Rules For AI

<project_meta>
## 项目上下文

- 技术栈：Next.js 15.5 / TS 5.9 / React 19 / Tailwind 4 / Zustand / TanStack Query / Supabase / Zod / Vitest / pnpm
- 本地开发 URL：`https://localhost:3000`
- 原则：TS 严格类型系统 + 测试验证双驱动、移动优先（Mobile First）
- 常用命令：`pnpm db:types:local`（生成 DB 类型）、`pnpm type-check`、`pnpm lint`
</project_meta>

<behavioral_mandates>
## AI 助手行为规范

### 1. 工作流（CoT）
目标：所有改动必须经过 Analyze / Design / Verify。

1. Analyze：全局检索读取相关代码/文档 + 本规则。
2. Design：用自然语言描述输入/输出、数据流、分层位置。
3. Review：对照本规则检查架构/分层/命名/错误处理/状态管理及设计冲突/遗漏。
4. Plan：拆分为覆盖修改、测试和验证的子任务并用 Todo 标记。
5. Implement：只改必要文件，复用现有模块。
6. Verify：TS/React 变更后必须执行 `pnpm type-check`、`pnpm lint` 并尽量自主修复；完成任务前要保证测试完整并执行通过。

### 2. 交互与权衡

- 低风险、易回滚决策（文案、非关键 UI）：可合理假设，在回答中说明假设条件。
- 高风险变更（新依赖/DB schema/基础设施）：必须列出 方案对比 并等待用户确认。
- 当与系统指令冲突时：明确假设与影响。
</behavioral_mandates>

<architecture_blueprint>
## 架构分层与模块 (Clean Architecture / Lightweight DDD)

本项目采用 **分层内核 + 垂直 Feature 切片** 的混合架构。

### 架构层级（由低到高）

#### L0 - Shared Kernel（无依赖，仅外部库如 zod）
- `src/shared/kernel/` — 技术原语（Result、AppError）
- `src/shared/domain/` — 跨 Feature 共享的业务概念（枚举、类型、协议）
- `src/shared/types/` — 自动生成的数据库类型
- `src/shared/utils/` — 纯工具函数（无 React 依赖）

#### L1 - Infrastructure（依赖: L0）
- `src/infra/` — 外部服务适配器（Supabase、tRPC、Logger、错误分类）

#### L2 - Presentation Foundation（依赖: L0, L1-可选）
- `src/presentation/components/` — 共享业务组件
- `src/presentation/hooks/` — 共享 React Hooks
- `src/presentation/context/` — 共享 Context Providers
- `src/presentation/schemas/` — 表单验证 Schemas
- `src/components/ui/` — shadcn/ui 原子组件

#### L3 - Features（依赖: L0, L1, L2）
- `src/features/*/` — 垂直业务切片（纵贯 Domain → Presentation 四层）

#### L4 - App Shell（依赖: L0-L3）
- `src/app/` — Next.js 路由、布局、全局 Provider
- `src/config/` — 环境配置与 Feature Flags

### 依赖规则

- **允许**: 高层 → 任意低层（非仅相邻层）
- **禁止**: 低层 → 高层
- **禁止**: 同层平行依赖（Features 之间除外，通过 `mod.ts`）

### 依赖矩阵

| 源 ↓ / 目标 → | kernel | domain | types | utils | infra | presentation | features |
|--------------|--------|--------|-------|-------|-------|--------------|----------|
| **kernel**   | -      | ❌     | ❌    | ❌    | ❌    | ❌           | ❌       |
| **domain**   | ✅     | -      | ❌    | ❌    | ❌    | ❌           | ❌       |
| **types**    | ❌     | ❌     | -     | ❌    | ❌    | ❌           | ❌       |
| **utils**    | ✅     | ❌     | ❌    | -     | ❌    | ❌           | ❌       |
| **infra**    | ✅     | ✅     | ✅    | ✅    | -     | ❌           | ❌       |
| **presentation** | ✅ | ✅     | ❌    | ✅    | ⚪    | -            | ❌       |
| **features** | ✅     | ✅     | ✅    | ✅    | ✅    | ✅           | ⚪       |
| **app**      | ✅     | ✅     | ❌    | ✅    | ✅    | ✅           | ✅       |

> ✅ 允许 | ❌ 禁止 | ⚪ 受限（通过 mod.ts / 可选）

### Feature 模块：垂直切片

Feature 是**纵贯 Clean Architecture 四层的垂直切片**：

```
feature/
├── mod.ts              唯一公开入口（跨 Feature 访问的唯一接口）
├── container.ts        轻量依赖注入工厂
├── domain/             ← Clean Arch: Domain 层
│   ├── *.model.ts      Zod Schema + 类型定义
│   └── *.errors.ts     领域错误工厂
├── application/        ← Clean Arch: Application 层
│   ├── ports/          仓储/服务接口（依赖倒置）
│   └── usecases/       用例实现，返回 Result<T, AppError>
├── infrastructure/     ← Clean Arch: Infrastructure 层
│   ├── repositories/   仓储实现（实现 ports 接口）
│   └── mappers/        数据映射器（DB 行 ↔ 领域模型）
├── api/                ← Clean Arch: Interface Adapter 层
│   ├── *.trpc.ts       tRPC Router
│   └── *.actions.ts    Server Actions
├── hooks/              ← Clean Arch: Presentation 层
│   └── use-*.ts        React hooks（封装数据获取与状态）
└── ui/                 ← Clean Arch: Presentation 层
    └── *.tsx           Feature 专属 UI 组件（Smart / Dumb）
```

Feature 内部子目录与全局共享设施的映射：

| Feature 子目录 | Clean Arch 层 | 依赖的全局共享设施 |
|---------------|--------------|-------------------|
| `domain/` | Domain | `src/shared/kernel`、`src/shared/domain` |
| `application/` | Application | 自身 domain + ports，`src/shared/kernel` |
| `infrastructure/` | Infrastructure | 自身 domain + ports，`src/infra` |
| `api/` | Interface Adapter | `src/infra/trpc`、`src/infra/server-actions`、自身 container |
| `hooks/` | Presentation | 自身 api，`src/presentation/hooks` |
| `ui/` | Presentation | 自身 hooks + domain types，`src/presentation/components` |

### 跨 Feature 通信规则

- **唯一接口**：跨 Feature 访问必须通过目标 Feature 的 `mod.ts`，禁止直接导入内部模块
- **允许传递的内容**：`mod.ts` 可导出 `type`、Server-side 函数、UI 组件
- **禁止循环依赖**：Feature 之间允许单向依赖，禁止 A→B→A

### 第三方库边界规则

外部服务只在 `src/infra` 或 Feature 的 `infrastructure/` 中直接导入：

| 代码位置 | 允许直接导入的第三方库 |
|---------|---------------------|
| `shared/*` | zod（仅 kernel/domain） |
| `infra` | @supabase/\*, @trpc/\*, AI SDK 等外部服务 |
| `infrastructure`（Feature 内） | @supabase/\* |
| `hooks`（Feature 内） | @tanstack/react-query |
| `ui` / `presentation/*` | React, shadcn/ui, zustand |

### API 与数据访问策略

- **Server Actions**：默认处理表单/简单 CRUD
- **tRPC**：仅用于对外 API 或复杂交互（文件上传 / 多端 / 长连接）
- **Supabase Client**：Server Client 用于写操作 & 复杂读；Browser Client 仅用于高频只读 & RLS 保护数据

### 数据库约定

- 字段默认 NOT NULL
- 启用 RLS
</architecture_blueprint>

<implementation_guide>
## 实现与编码规范

### 1. 命名约定

- 文件：`kebab-case`，可加 `.scope` 标记（例如：`user.model.ts`）
- 变量 / 函数：`camelCase`；类型 / Schema / 组件：`PascalCase`；常量：`UPPER_SNAKE_CASE`。
- DB：`snake_case`
- Supabase：参数键 `camelCase`；内嵌原始 SQL 中 DB 标识符用 `snake_case`。
- 迁移：`YYYYMMDDHHMMSS_description.sql`
- Server Actions：使用 `action` 后缀（如 `submitOrderAction`）。
- React：
  - Props 类型：`[ComponentName]Props`
  - 事件处理：`handle[Event]`，与 Prop `on[Event]` 区分。
- 枚举：`as const` 对象 + 推导 union，禁用 TS `enum`；Key `PascalCase`，Value `snake_case`。

### 2. 组件与状态架构

- RSC 优先：默认 Server Component；仅叶子组件使用 'use client'。
- Smart Component / Dumb Component：Feature 组件负责数据 & 业务；UI 组件只展示。
- 状态优先级：URL > TanStack Query > Zustand > useState。
- 基础 UI：默认 shadcn/ui。
- UI 尽量 Logic-Free JSX。

### 3. 通用编码规范

- 导出：优先命名导出；仅 Next.js 约定文件（`page.tsx`、`layout.tsx`、`route.ts`）允许默认导出。
- 环境变量：仅通过 `src/config/env.ts`，禁用 `process.env`。
- 日志：使用 `src/infra/observability/logger.ts`，禁止 `console.*`。
- 安全：禁止在代码和日志中输出 secret / token 等敏感信息。
- 风格：优先 `const` / 纯函数 / 不可变数据；避免 class / 继承 / 全局可变状态（除非第三方库要求）。
- 兼容性：不做非必要的向后兼容；需要变更时直接演进并更新调用方。

### 4. TypeScript 类型安全

- TS 严格：假定 `strict: true`；类型导入用 `import type`。
- 派生：领域类型通过 Zod Schema 推导；UI 类型尽量从领域类型衍生。
- 精确建模：优先 union / discriminated union / generic / conditional / index / mapped / type guard，避免滥用可选字段。
- 保持类型信息：使用 Generic Type / `keyof` / `typeof` / Index Access Type / Mapped Type。
- 禁止：不必要的 `any`、多余的 `as` 断言。

### 5. 语言与注释风格

- 语言：默认中文；技术标识符保留英文。
- 注释：只解释「为什么」，不复述代码行为。

### 6. 错误处理与 Result 模式

- 策略：业务错误用 Result 表达，系统错误用异常。
- 统一 Result：`src/shared/kernel/result.ts`；`DomainError`：`src/shared/kernel/errors.ts`。
- Domain / Application：业务规则错误返回 `Result<T, DomainError>`；不通过异常表达业务错误。
- Infrastructure：可预期情况用 `Result` 或 `null`；系统异常允许抛异常，由上层捕获。
- UI：解包 `Result`：`success: true` → data 更新 UI；`success: false` → Toast/表单错误。
- UI：异常交给 Next.js Error Boundary。

### 7. 领域建模与枚举

- 领域模型：使用 Zod 定义 Schema + `z.infer` 派生类型。
- 枚举：使用 `as const` 对象 + 推导 union（遵循「枚举策略」）。

### 8. 数据模型与外部系统

- 内部模型保持一致性。
- 外部系统（第三方 API / Supabase 原始返回）必须通过 ACL（Anti-Corruption Layer）转换再进入 Domain。

### 9. 数据获取策略

- Server 端：
  - 在 Server Components 或 Server Actions 中直接访问 DB；
  - 遵守「API 与数据访问策略」中的约定（Server Actions vs tRPC、Server/Browser Client）。
- Client 端：
  - 优先 `use(Promise)` 或 TanStack Query；
  - 避免用 `useEffect` 获取数据。

### 10. 性能与缓存

- 视情况使用 Server Caching、Client Caching 和 Optimistic Updates。
</implementation_guide>

<testing_strategy>
## 测试策略

- 静态：`pnpm type-check` / `pnpm lint`
- 单元测试：Vitest，和源码同目录（`*.test.ts`）。
- Feature 集成测试：`src/features/[module]/tests/*.test.ts`；
- 系统集成测试：`tests/integration/*.spec.ts`。
- 非 trivial 逻辑：实现时必须写单元测试。
- 关键数据流：变更时必须补集成测试。
</testing_strategy>

<quality_gates>
## 完成定义（Definition of Done）

在标记任务完成前，至少满足：

- 静态分析：`pnpm type-check` / `pnpm lint` 通过。
- 测试：相关单元测试 / 集成测试已更新并通过。
- 可观测性：关键事件使用统一 logger，无残留 `console.*`。
- 代码整洁：无死代码 / 未使用导出 / 临时代码，遵循 YAGNI。
- 魔法值：重要常量命名，不用魔法字符串/数字。
- 类型安全：领域类型从 Zod Schema 推导，无不必要 any / 断言。
- 关键行为：核心用户流程已验证（测试或说明验证方式）。
</quality_gates>
