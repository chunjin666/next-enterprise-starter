import { createClient } from '@/infra/supabase/server-client'
import type { Result } from '@/shared/kernel/result'
import { err } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'
import { AppErrorCode, createAppError } from '@/shared/kernel/errors'

export type AuthenticatedActionResult<T> = Result<T, AppError>

export async function withAuthenticatedUser<T>(
  handler: (ctx: { userId: string }) => Promise<AuthenticatedActionResult<T>>,
): Promise<AuthenticatedActionResult<T>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return err(
      createAppError({
        code: AppErrorCode.Unauthenticated,
        message: 'User is not authenticated',
        userMessage: '用户未登录或会话已过期',
        severity: 'medium',
        retryable: true,
      }),
    )
  }

  return handler({ userId: user.id })
}

