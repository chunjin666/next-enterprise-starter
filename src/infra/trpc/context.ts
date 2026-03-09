import { createClient } from '@/infra/supabase/server-client'
import type { Database } from '@/shared/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import 'server-only'

export interface Context {
  supabase: SupabaseClient<Database>
  req: CreateNextContextOptions['req']
  res: CreateNextContextOptions['res']
  cacheControl?: string
}

export async function createTRPCContext(opts: CreateNextContextOptions): Promise<Context> {
  const { req, res } = opts
  const supabase = await createClient<Database>()
  return { supabase, req, res }
}
