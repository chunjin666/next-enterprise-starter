import { createTransformingFetch } from './transform-utils'
import type { Database } from '@/shared/types/database'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient<
  TDatabase = unknown,
  SchemaName extends string & keyof Omit<TDatabase, '__InternalSupabase'> = 'public' extends keyof Omit<
    TDatabase,
    '__InternalSupabase'
  >
    ? 'public'
    : string & keyof Omit<TDatabase, '__InternalSupabase'>,
>(
  options?: Parameters<typeof createBrowserClient<TDatabase, SchemaName>>[2]
): ReturnType<typeof createBrowserClient<TDatabase, SchemaName>> {
  const originalFetch = options?.global?.fetch || fetch
  const transformingFetch = createTransformingFetch(originalFetch)
  return createBrowserClient<TDatabase, SchemaName>(supabaseUrl, supabaseKey, {
    ...options,
    global: { ...options?.global, fetch: transformingFetch },
  } as Parameters<typeof createBrowserClient<TDatabase, SchemaName>>[2])
}

export const supabase = createClient<Database, 'public'>({
  cookies: undefined as never,
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, debug: false },
  global: { headers: { 'X-Client-Info': 'hello-work-next' } },
  realtime: { params: { eventsPerSecond: 10, log_level: 'error' } },
})
