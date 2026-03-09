import { createTransformingFetch } from './transform-utils'
import { getContext, setContext, getContextStore, createCtxKey } from '@/infra/context'
import type { Database } from '@/shared/types/database'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { cache } from 'react'
import 'server-only'

// 定义 Context Keys 用于缓存
const SupabaseClientPromiseKey = createCtxKey<Promise<unknown>>('_supabaseClientPromise', { loggable: false })
const SupabaseServiceRoleClientKey = createCtxKey<SupabaseClient>('_supabaseServiceRoleClient', { loggable: false })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * 内部实现函数，每次调用都会创建新实例。
 * 业务层不应直接使用此函数，而应使用导出的 cache 版本。
 */
async function _createSupabaseClient<
  TDatabase = Database,
  SchemaName extends string & keyof Omit<TDatabase, '__InternalSupabase'> = 'public' extends keyof Omit<
    TDatabase,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<TDatabase, '__InternalSupabase'>,
>(
  options?: Partial<Parameters<typeof createServerClient<TDatabase, SchemaName>>[2]>
): Promise<ReturnType<typeof createServerClient<TDatabase, SchemaName>>> {
  const cookieStore = await cookies()
  const originalFetch = options?.global?.fetch || fetch
  const transformingFetch = createTransformingFetch(originalFetch)
  return createServerClient<TDatabase, SchemaName>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    ...options,
    global: { ...options?.global, fetch: transformingFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cs) {
        try {
          cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {}
      },
      ...options?.cookies,
    },
  } as Parameters<typeof createServerClient<TDatabase, SchemaName>>[2])
}

// 内部：React cache 版本
const _reactCachedCreateClient = cache(_createSupabaseClient)

/**
 * 默认的服务端客户端工厂。
 * 采用混合缓存策略：
 * 1. 如果在 ALS 上下文中（如 tRPC），优先使用 ALS 缓存。
 * 2. 否则尝试使用 React cache（RSC 环境）。
 * 3. 兜底直接创建（无缓存）。
 */
export const createClient = async <
  TDatabase = Database,
  SchemaName extends string & keyof Omit<TDatabase, '__InternalSupabase'> = 'public' extends keyof Omit<
    TDatabase,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<TDatabase, '__InternalSupabase'>,
>(
  options?: Partial<Parameters<typeof createServerClient<TDatabase, SchemaName>>[2]>
): Promise<ReturnType<typeof createServerClient<TDatabase, SchemaName>>> => {
  // 1. 尝试 ALS 缓存 (仅当无特殊 options 时)
  if (!options && getContextStore()) {
    const cachedPromise = getContext(SupabaseClientPromiseKey)
    if (cachedPromise) {
      return cachedPromise as Promise<ReturnType<typeof createServerClient<TDatabase, SchemaName>>>
    }

    const promise = _createSupabaseClient<TDatabase, SchemaName>(options)
    setContext(SupabaseClientPromiseKey, promise)
    return promise
  }

  // 2. 尝试 React cache (RSC 环境)
  try {
    // @ts-ignore: Generic type passing complexity
    return _reactCachedCreateClient(options) as Promise<ReturnType<typeof createServerClient<TDatabase, SchemaName>>>
  } catch (_e) {
    // 3. 兜底：直接创建 (非 RSC 且无 ALS)
    return _createSupabaseClient<TDatabase, SchemaName>(options)
  }
}

/**
 * 用于需要全新实例的场景（例如需要特定配置、绕过缓存）。
 * 不带缓存，每次调用返回新客户端。
 */
export const createIsolatedClient = _createSupabaseClient

// 内部：Service Role 客户端创建逻辑
function _createServiceRoleClient<
  TDatabase = Database,
  SchemaName extends string & keyof Omit<TDatabase, '__InternalSupabase'> = 'public' extends keyof Omit<
    TDatabase,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<TDatabase, '__InternalSupabase'>,
>(
  options?: Partial<Parameters<typeof createSupabaseJsClient<TDatabase, SchemaName>>[2]>
): ReturnType<typeof createSupabaseJsClient<TDatabase, SchemaName>> {
  const originalFetch = options?.global?.fetch || fetch
  const transformingFetch = createTransformingFetch(originalFetch)
  return createSupabaseJsClient<TDatabase, SchemaName>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    ...options,
    global: { ...options?.global, fetch: transformingFetch },
    cookies: undefined, // Service Role 不需要 cookies
  } as Parameters<typeof createSupabaseJsClient<TDatabase, SchemaName>>[2])
}

// 内部：React cache 版本
const _reactCachedCreateServiceRoleClient = cache(_createServiceRoleClient)

/**
 * 创建拥有 Service Role 权限的客户端（绕过 RLS）。
 * 同样使用混合缓存策略。
 */
export const createServiceRoleClient = function <
  TDatabase = Database,
  SchemaName extends string & keyof Omit<TDatabase, '__InternalSupabase'> = 'public' extends keyof Omit<
    TDatabase,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<TDatabase, '__InternalSupabase'>,
>(
  options?: Partial<Parameters<typeof createSupabaseJsClient<TDatabase, SchemaName>>[2]>
): ReturnType<typeof createSupabaseJsClient<TDatabase, SchemaName>> {
  // 1. 尝试 ALS 缓存 (仅当无特殊 options 时)
  if (!options && getContextStore()) {
    const cached = getContext(SupabaseServiceRoleClientKey)
    if (cached) {
      return cached as ReturnType<typeof createSupabaseJsClient<TDatabase, SchemaName>>
    }

    const client = _createServiceRoleClient<TDatabase, SchemaName>(options)
    
    setContext(SupabaseServiceRoleClientKey, client as unknown as SupabaseClient)
    return client
  }

  // 2. 尝试 React cache
  try {
    // @ts-ignore
    return _reactCachedCreateServiceRoleClient(options) as ReturnType<
      typeof createSupabaseJsClient<TDatabase, SchemaName>
    >
  } catch (_e) {
    // 3. 兜底
    return _createServiceRoleClient<TDatabase, SchemaName>(options)
  }
}
