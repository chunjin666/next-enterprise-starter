# Next Enterprise Starter

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js" alt="Next.js 15.5">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT">
</p>

<p align="center">
  <b>Enterprise-Grade Next.js Full-Stack Starter</b><br>
  AI Native · Layered Kernel + Vertical Feature Slices · Type-Safe · Production-Ready
</p>

---

## Why Choose This Project?

> 💡 **Solving Real Pain Points**: Distilled from countless enterprise-grade projects, not just a demo, but a production-ready architecture template you can use directly.

- 🏗️ **Clear & Scalable Layered Architecture** — Clean Architecture + ESLint enforcement, architecture boundaries guaranteed automatically
- 🎯 **End-to-End Type Safety** — From database to UI, one change propagates types across the entire chain
- 🤖 **AI Native Design** — Architecture optimized for AI Agents / LLMs, enabling precise code understanding and modification
- 🚀 **Developer Experience First** — Automatic naming conversion, intelligent prefetching, one-click development environment
- 📊 **Built-in Observability** — Structured logging, error classification, performance tracking out of the box

---

## 🤖 AI Native Architecture Design

This project is designed from the ground up to be **AI Agent / LLM-friendly**, enabling AI to precisely understand code structure and autonomously complete complex modifications:

### 1. Explicit Architecture Constraints (Architecture as Code)

Dependency rules are not suggestions in documentation, but **executable code**:

```javascript
// eslint.config.js —— Architecture rules directly parseable by AI
'boundaries/element-types': ['error', {
  rules: [
    { from: 'L0_Primitives', disallow: ['L1_Infra', 'L2_UI_State', 'L3_Features'] },
    { from: 'L1_Infra', disallow: ['L2_UI_State', 'L3_Features'] },
   L2_UI_State', disallow: ['L3_Features'] },
  ]
}]
```

 { from: '**Value for AI**:
- LLM reads AGENTS.md to precisely understand layer boundaries
- ESLint blocks cross-layer calls during code modification, AI can self-correct
- No need to understand the entire project, just focus on the current layer and allowed dependency layers

### 2. Structured Project Metadata (AGENTS.md)

Project specification document for AI consumption:

| Section | Content | AI Use |
|---------|---------|--------|
| `<project_meta>` | Tech stack, URL, common commands | Context initialization |
| `<architecture_blueprint>` | L0-L4 layer definitions, dependency matrix | Code location decisions |
| `<implementation_guide>` | Naming conventions, error handling, type safety | Code generation constraints |
| `<testing_strategy>` | Testing strategy, file naming | Test generation guidance |
| `<quality_gates>` | Definition of done, checklist | Task completion verification |

**Value for AI**:
- Get full project overview at once, reducing repeated searches
- Clear decision rules, reducing hallucination probability
- Standardized workflow (Analyze → Design → Review → Plan → Implement → Verify)

### 3. Vertical Slices Reduce Cognitive Load

Each Feature is a **self-contained context window**:

```
features/todos/
├── domain/todo.model.ts          # AI modifies here → affects type definitions
├── application/create-todo.usecase.ts  # AI modifies here → affects business logic
├── infrastructure/todo.repository.ts   # AI modifies here → affects data access
├── api/todos.actions.ts          # AI modifies here → affects API interface
├── hooks/use-todos.ts            # AI modifies here → affects frontend state
└── ui/todo-list.tsx              # AI modifies here → affects UI display
```

**Value for AI**:
- Predictable modification scope, won't accidentally affect other Features
- Single responsibility per layer, AI-generated code is more compliant
- Explicit exports via `mod.ts`, AI knows what can be dependencies

### 4. Types as Documentation (Zod Schema Driven)

Domain models defined with Zod, AI can understand **runtime validation** and **static types** simultaneously:

```typescript
// When AI reads this line, it knows:
// 1. Runtime validation rules (Zod)
// 2. TypeScript types (z.infer)
// 3. Field constraints (min/max/email, etc.)
export const UserSchema = z.object({
  id: z.string().ulid(),
  email: z.string().email(),
  name: z.string().min(2).max(50),
  role: z.enum(['admin', 'user']),
})
export type User = z.infer<typeof UserSchema>
```

**Precise Type Definitions in AGENTS.md**:

```typescript
// Type system throughout the entire chain —— From Domain to UI
Domain:Todo → Application:UseCase → Infrastructure:Repository → API:Action → UI:Component
     ↑              ↑                      ↑                   ↑              ↑
   Zod Schema    Input Validation      Data Mapping        Request Validation   Form Types
```

**Value for AI**:
- Understand data constraints without reading comments
- **Automatic Type Propagation**: Modify Zod Schema → Type inference updates → Full chain type checking → AI can trace impact scope and auto-fix
- Use Zod constraints directly when generating test data

### 5. Result Type Eliminates Exception Control Flow

Business errors returned explicitly, AI can **statically analyze all code paths**:

```typescript
// AI can determine: this function has only two results, no exceptions thrown
async function createTodo(input: unknown): Promise<Result<Todo, TodoError>> {
  const parsed = TodoSchema.safeParse(input)
  if (!parsed.success) {
    return err(new ValidationError(parsed.error))
  }
  // ... won't throw unexpectedly, AI doesn't need to consider try-catch
  return ok(todo)
}

// Call sites are clear
const result = await createTodo(input)
if (!result.ok) {
  // AI knows error is handled here, won't miss it
  return handleError(result.error)
}
// AI knows result.value definitely exists here
return result.value
```

**Value for AI**:
- Control flow explicit, AI won't miss error handling branches
- No need to analyze exception propagation paths, reducing reasoning complexity
- Structured error types, AI can generate precise error messages

### 6. Automatic Naming Conversion Reduces Cognitive Noise

AI doesn't need to handle `snake_case` vs `camelCase` mapping:

```typescript
// AI reads/writes camelCase, no need to remember database field names
const todo = await supabase
  .from('todos')
  .insert({ title, userId, isPublic })  // AI writes camelCase
  .select('id, title, userId, createdAt')  // AI selects camelCase
  .single()

// Returned todo is also camelCase, AI can use directly
todo.createdAt  // not todo.created_at
```

**Value for AI**:
- Consistent naming style, reduces token consumption
- No need to maintain two naming mental models
- Type generation is also camelCase, type checking more intuitive

## Key Features

### 🏛️ Layered Kernel + Vertical Feature Slices

A unique **hybrid architecture pattern** with Clean Architecture's clear layering and Feature-Based high cohesion:

```
┌─────────────────────────────────────────────────┐
│  L4 - App Shell (Routes, Layout, Provider)     │
├─────────────────────────────────────────────────┤
│  L3 - Features (Vertical Business Slices)      │
│     ┌──────────────────────────────────────┐   │
│     │  Domain → Application → Infra → UI   │   │
│     └──────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  L2 - Presentation (Shared UI/Hooks/Context)   │
├─────────────────────────────────────────────────┤
│  L1 - Infrastructure (Supabase/tRPC/Logger)     │
├─────────────────────────────────────────────────┤
│  L0 - Shared Kernel (Result, Errors, Utils)    │
└─────────────────────────────────────────────────┘
```

**Dependency rules enforced by ESLint** — lower layers can't import higher layers, cross-Feature access only through `mod.ts`.

### 🔄 Automatic Naming Conversion Mechanism

Database `snake_case` ↔ Application `camelCase` **fully automatic bidirectional conversion**, no need to think during development:

```typescript
// Your code —— pure camelCase
const { data } = await supabase
  .from('todos')
  .select('id, title, userId, createdAt')
  .eq('userId', userId)

// Actual request —— automatically converted to snake_case
// SELECT id, title, user_id, created_at FROM todos WHERE user_id = ?

// Response —— automatically converted back to camelCase
console.log(data[0].createdAt) // ✓ Use directly
```

Type declarations are also converted: types generated by `pnpm db:types:local` are all camelCase.

### 🛡️ Result Type & Unified Error Handling

Goodbye `try-catch` hell, business errors expressed explicitly:

```typescript
// Domain / Application layer
async function createTodo(input: TodoInput): Promise<Result<Todo, TodoError>> {
  if (input.title.length < 3) {
    return err(new TodoError({ code: 'TITLE_TOO_SHORT', userMessage: 'Title must be at least 3 characters' }))
  }
  // ... persist
  return ok(todo)
}

// UI layer
const result = await createTodo(input)
if (!result.ok) {
  toast.error(result.error.userMessage) // User-friendly error message
  return
}
setTodos(prev => [...prev, result.value]) // Type-safe data access
```

**Automatic Error Classification**: Network errors, auth failures, permission denied, data conflicts... each error type has standardized handling strategies.

### ⚡ Intelligent Prefetch System

TanStack Query-based prefetch wrapper, supporting hover-triggered, auto-triggered, and manual-triggered prefetching:

```typescript
const { prefetch } = usePrefetch({
  key: ['todos', userId],
  task: () => fetchTodos(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes freshness
})

// Auto-prefetch on hover (200ms delay for debouncing)
<Link href="/todos" onMouseEnter={prefetch}>
```

### 🔍 Built-in Observability

- **Structured Logging**: Pino + Request tracing ID, consistent development/production
- **tRPC Middleware**: Automatic request duration logging, input/output, error classification
- **Error Tracking**: Unified adaptation for Supabase/tRPC/custom errors, automatic context injection

### 🤖 AI Vector Embedding Support

Built-in Embedding Service interface, supporting SiliconFlow/OpenAI, easily implement semantic search:

```typescript
const embedding = await embeddingService.generateEmbedding({
  text: "User query content",
  model: "BAAI/bge-m3"
})
// Returns 1024-dimensional vector, can be directly stored in PostgreSQL pgvector
```

### 📦 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.5 (App Router) / React 19 |
| **Language** | TypeScript 5.9 (Strict Mode) |
| **Styling** | Tailwind CSS 4 / shadcn/ui |
| **State** | Zustand / TanStack Query |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **API** | tRPC 11 / Server Actions |
| **Validation** | Zod 4 |
| **Testing** | Vitest + React Testing Library |
| **Tools** | pnpm / ESLint / Husky |

## Quick Start

### 1. Clone the Project

```bash
git clone https://github.com/your-username/next-enterprise-starter.git
cd next-enterprise-starter
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase configuration. Required environment variables for local development:

| Variable | Description | How to Obtain |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL (via Caddy proxy) | Fixed to `https://localhost:44321` for local development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous access key | Get from `pnpm db:start` output |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side use) | Get from `pnpm db:start` output |
| `SUPABASE_INTERNAL_URL` | Supabase internal URL (bypasses Caddy) | Fixed to `http://127.0.0.1:54321` for local development |

> **Tip**: After running `pnpm db:start`, the terminal will output `anon key` and `service_role key`. Copy them to `.env.local`.

### 4. Start Local Supabase

```bash
# Install Supabase CLI (if not installed)
# brew install supabase/tap/supabase

# Start local Supabase
pnpm db:start

# Run database migrations and generate types
pnpm dev:prepare
```

### 5. Generate Local HTTPS Certificate (Required)

The project uses HTTPS for development by default to be compatible with Supabase and third-party services mixed content strategy.

```bash
# Install mkcert (if not installed)
brew install mkcert

# Install local CA to system trust list
mkcert -install

# Generate certificate to certs/ directory
mkcert --cert-file certs/localhost+2.pem --key-file certs/localhost+2-key.pem localhost 127.0.0.1 ::1
```

> **Note**: Certificate files are not committed to Git, each developer needs to generate locally.

### 6. Start Development Server

```bash
pnpm dev
```

Visit https://localhost:3000

## Caddy Local Reverse Proxy

The project uses Caddy as a local reverse proxy, forwarding `https://localhost:44321` to Supabase local service (`http://127.0.0.1:54321`) to prevent browsers from blocking mixed content.

`pnpm dev` will automatically start Caddy (if not running).

### Install Caddy (if not installed)

```bash
# macOS
brew install caddy

# Linux
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sL https://get.caddyserver.com | sudo bash
```

> **Note**: Caddy process will automatically request certificates on first run, subsequent starts will reuse them.

## Project Structure

```
src/
├── app/                    # Next.js App Router (L4 - App Shell)
│   ├── _providers/         # Global Provider composition
│   ├── api/trpc/           # tRPC API routes
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── register/           # Register page
│   └── todos/              # Todos page
├── features/               # L3 - Vertical Business Slices
│   └── todos/              # Example: Complete Feature spanning four layers
│       ├── mod.ts          # Only public entry (cross-Feature access interface)
│       ├── container.ts    # Lightweight dependency injection
│       ├── domain/         # Domain layer: Zod Schema + business rules
│       ├── application/    # Application layer: UseCase + Ports
│       ├── infrastructure/ # Infrastructure layer: Repository implementation
│       ├── api/            # Interface Adapter: tRPC / Server Actions
│       ├── hooks/          # Presentation layer: Data fetching Hooks
│       └── ui/             # Presentation layer: Feature UI components
├── presentation/           # L2 - Shared Presentation Layer
│   ├── components/         # Business components
│   ├── hooks/              # Shared React Hooks
│   ├── context/            # Shared Context
│   └── schemas/            # Form validation Schemas
├── infra/                  # L1 - Infrastructure
│   ├── supabase/           # Supabase client + naming conversion
│   ├── trpc/               # tRPC configuration + middleware
│   ├── prefetch/           # Intelligent prefetch system
│   ├── errors/             # Error classification + adapters
│   ├── observability/      # Structured logging
│   └── ai/                 # AI Embedding service
├── shared/                 # L0 - Shared Kernel (Zero Dependencies)
│   ├── kernel/             # Result type, AppError
│   ├── domain/             # Cross-Feature business concepts
│   ├── types/              # Auto-generated camelCase DB types
│   └── utils/              # Pure utility functions
└── config/                 # Environment configuration + Feature Flags
```

## Feature Development Example

A complete Feature spans four layers, high cohesion, low coupling:

```typescript
// 1️⃣ Domain Layer —— Define business rules
// features/todos/domain/todo.model.ts
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  completed: z.boolean(),
  userId: z.string(),
  createdAt: z.string().datetime(),
})
export type Todo = z.infer<typeof TodoSchema>

// 2️⃣ Application Layer —— Orchestrate use cases
// features/todos/application/usecases/create-todo.usecase.ts
export class CreateTodoUseCase {
  constructor(private todoRepo: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Result<Todo, TodoError>> {
    const todo = Todo.create(input)
    if (todo.isErr()) return err(todo.error)

    return await this.todoRepo.save(todo.value)
  }
}

// 3️⃣ Infrastructure Layer —— Implement persistence
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

// 4️⃣ API Layer —— Expose interface
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

// 5️⃣ UI Layer —— Component implementation
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

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (HTTPS) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check (includes architecture boundary rules) |
| `pnpm type-check` | TypeScript type checking |
| `pnpm test` | Run tests (with coverage) |
| `pnpm verify` | Full verification (secrets + lint + type-check + test + build) |
| `pnpm db:start` | Start local Supabase |
| `pnpm db:reset` | Reset database |
| `pnpm db:types:local` | Generate camelCase database types |
| `pnpm dev:prepare` | One-click development environment initialization |

## Architecture Principles

### Layer Dependency Matrix

| Source ↓ / Target → | L0 Kernel | L1 Infra | L2 Presentation | L3 Features |
|---------------------|:---------:|:--------:|:---------------:|:-----------:|
| **L0 Kernel** | — | ❌ | ❌ | ❌ |
| **L1 Infra** | ✅ | — | ❌ | ❌ |
| **L2 Presentation** | ✅ | ⚪ | — | ❌ |
| **L3 Features** | ✅ | ✅ | ✅ | ⚪ |
| **L4 App** | ✅ | ✅ | ✅ | ✅ |

> ✅ Allowed | ❌ Forbidden | ⚪ Restricted (optional/via mod.ts)

**ESLint automatic enforcement**: Violating dependency rules will directly report errors.

### Key Design Decisions

1. **Vertical Slices First**: Organize new features by business domain, not by technology type
2. **Explicit Dependencies**: Manual injection via `container.ts`, easy to test and replace
3. **Errors as Types**: Business errors expressed with `Result<T, E>`, no exceptions thrown
4. **Type-Driven Development**: Define Zod Schema first, then derive TypeScript types

## Automatic Naming Conversion Mechanism

The project implements automatic bidirectional conversion between database field naming (snake_case) and application layer naming (camelCase), covering both runtime and type declaration layers, eliminating manual handling during development.

### 1. Runtime Automatic Conversion

Conversion happens at the Supabase client request/response layer:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Code (camelCase)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Request body / URL params
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              createTransformingFetch (Request Interception)       │
│  • Request body: { userId: "xxx" } → { user_id: "xxx" }       │
│  • URL params: ?userId=xxx → ?user_id=xxx                       │
│  • Supabase chain: .eq("userId", value) → .eq("user_id", value) │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase PostgREST API                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Response body
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              createTransformingFetch (Response Interception)     │
│  • Response body: { user_id: "xxx", created_at: "..." }        │
│         → { userId: "xxx", createdAt: "..." }                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Your Code (camelCase)                     │
└─────────────────────────────────────────────────────────────────┘
```

**Core Implementation**:

| File | Responsibility |
|------|----------------|
| `src/infra/utils/case-converter.ts` | Recursively convert object keys (camelCase ↔ snake_case) |
| `src/infra/supabase/transform-utils.ts` | Custom fetch, intercept requests/responses for auto-conversion |
| `src/infra/supabase/smart-url.ts` | Handle Supabase chain API (`.eq()`, `.or()`, etc.) |

**Usage Example**:

```typescript
// Application layer uses camelCase
const { data, error } = await supabase
  .from('todos')
  .select('id, title, userId, createdAt')  // camelCase

// Response automatically converted to camelCase
console.log(data[0].userId)    // ✓ "xxx"
console.log(data[0].createdAt) // ✓ "2024-01-01T00:00:00Z"

// Chain queries also support camelCase
const { data } = await supabase
  .from('todos')
  .eq('userId', userId)         // Auto-converted to user_id
  .or('status.eq.pending,and(status.eq.in_progress)") // Internal fields auto-converted
```

### 2. Type Declaration Auto-Conversion

Field names in database-generated type files (`lib/types/database.ts`) are also automatically converted from snake_case to camelCase, ensuring type safety matches code.

**Conversion Scope**:

- `Database.public.Tables.{table}.Row` - Table row types
- `Database.public.Tables.{table}.Insert` - Insert types
- `Database.public.Tables.{table}.Update` - Update types
- `Database.public.Views.{view}.Row` - View types
- `Database.public.Functions.{func}.Args` - Function argument types
- `Database.public.Functions.{func}.Returns` - Function return types
- `Database.public.Tables.{table}.Relationships[].columns` - Relationship column names
- `Database.public.Tables.{table}.Relationships[].referencedColumns` - Referenced column names

**Core Implementation**:

| File | Responsibility |
|------|----------------|
| `scripts/db-type-transform.js` | TypeScript AST transformer, converts snake_case property names in generated type files to camelCase |
| `lib/types/database.source.ts` | Original type file (generated by Supabase CLI) |
| `lib/types/database.ts` | Converted type file (camelCase) |

**Workflow**:

```
┌─────────────────────────────────────────────────────────────────┐
│              Supabase CLI (pnpm db:types:local)                  │
│  • Connect to local database                                     │
│  • Generate database.source.ts (snake_case)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              db-type-transform.js (AST Transformation)          │
│  • Parse TypeScript AST                                         │
│  • Convert property names in Tables/Views/Functions            │
│  • Output database.ts (camelCase)                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application layer uses camelCase types             │
└─────────────────────────────────────────────────────────────────┘
```

**How to Use During Development**:

```typescript
// Use camelCase types directly, no manual conversion needed
import type { Database } from '@/shared/types'

type Todo = Database['public']['Tables']['todos']['Row']
// Converts to: { id: number; title: string; userId: string; createdAt: string; ... }

// Also use camelCase when inserting data
type TodoInsert = Database['public']['Tables']['todos']['Insert']
// Converts to: { title: string; userId?: string; ... }
```

### Notes

- **Runtime Conversion**: Automatically applies to all requests using the project's Supabase client (`server-client.ts` / `browser-client.ts`)
- **Type Declaration Conversion**: Automatically triggered when running `pnpm db:types:local`, generates camelCase types
- **Auth Requests**: Auth-related requests (`/auth/`) skip runtime conversion to keep Supabase Auth working
- **Direct SQL**: When using `.rpc()` to call stored procedures, manual naming conversion is needed

## Who Is This Project For?

| Scenario | Description |
|----------|-------------|
| **AI-Driven Development Teams** | Using AI tools like Cursor/Copilot/Claude, need AI-friendly codebase |
| **Startup MVP Teams** | Skip architecture setup, start business development directly |
| **Enterprise Applications** | Large projects requiring long-term maintenance and team collaboration |
| **Tech Upgrade** | Migrating from traditional MVC to modern layered architecture |
| **Learning Reference** | Understanding Clean Architecture practices in the React ecosystem |

## Roadmap

- [x] Clean Architecture Layered Architecture
- [x] **AI Native Architecture Design** — AGENTS.md specs, explicit dependency constraints
- [x] Automatic Naming Conversion Mechanism
- [x] Result Type & Unified Error Handling
- [x] Intelligent Prefetch System
- [x] AI Embedding Support
- [ ] Realtime subscription wrapper
- [ ] File upload/storage abstraction
- [ ] Background task queue
- [ ] Multi-tenant support
- [ ] MCP (Model Context Protocol) integration

## Contributing

Issues and PRs are welcome! Please ensure:

1. Code passes `pnpm verify`
2. Follows existing architecture layering
3. New features include tests

## License

MIT © [Your Name]
