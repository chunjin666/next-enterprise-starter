import { PostgrestError } from '@supabase/supabase-js'
import { TRPCClientError } from '@trpc/client'
import { fromSupabaseError, fromTRPCClientError } from './adapters'
import { baseClassifyError } from './core'
import { type AppError, isAppError } from '@/shared/kernel/errors'

export function classifyError(error: unknown, context?: Record<string, unknown>): AppError {
    // 0. Check if it's already an AppError
    if (isAppError(error)) {
      if (context) {
        error.context = { ...error.context, ...context }
      }
      return error
    }

    // 1. Try TRPC Error
    if (error instanceof TRPCClientError) {
      const enhanced = fromTRPCClientError(error)
      if (context) {
        enhanced.context = { ...enhanced.context, ...context }
      }
      return enhanced
    }

    // 2. Try Supabase/Postgrest Error
    if (error instanceof PostgrestError) {
      const enhanced = fromSupabaseError(error)
      if (context) {
        enhanced.context = { ...enhanced.context, ...context }
      }
      return enhanced
    }

    // 3. Fallback to base classifier
    if (error instanceof Error) {
      return baseClassifyError(error, context)
    }

    if (typeof error === 'string') {
      return baseClassifyError(error, context)
    }

    // 4. Last resort
    return baseClassifyError(String(error), context)
  }
