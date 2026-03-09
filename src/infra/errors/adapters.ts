import { type AppError, createAppError, AppErrorCode, AppErrorSeverity } from '@/shared/kernel/errors'
import { baseClassifyError } from '@/infra/errors/core'
import type { PostgrestError } from '@supabase/supabase-js'
import type { TRPCClientError } from '@trpc/client'
import type { InferrableClientTypes } from '@trpc/server/unstable-core-do-not-import'

export function fromHTTPStatus(status: number, message?: string, extra?: Record<string, unknown>): AppError {
  const baseMessage = message || `HTTP ${status}`
  return baseClassifyError(baseMessage, {
    statusCode: status,
    isHTTPError: true,
    ...extra
  })
}

export async function assertOk(response: Response): Promise<Response> {
  if (!response.ok) {
    const err = fromHTTPStatus(response.status, `HTTP ${response.status}: ${response.statusText}`)
    throw err
  }
  return response
}

export function fromZod(error: unknown): AppError[] {
  type ZodIssue = { path: Array<string | number>; message: string }
  const z = error as { errors?: ZodIssue[] }
  if (Array.isArray(z.errors)) {
    return z.errors.map((issue) =>
      createAppError({
        code: AppErrorCode.ValidationFailed,
        message: `Validation failed for ${issue.path.join('.')}: ${issue.message}`,
        userMessage: issue.message || '输入格式有误',
        severity: AppErrorSeverity.Low,
        retryable: false,
        context: {
          field: issue.path.join('.'),
          validationMessage: issue.message,
          isValidationError: true
        }
      })
    )
  }
  const err = error instanceof Error ? error : new Error(String(error))
  return [baseClassifyError(err, { isValidationError: true })]
}

export function fromSupabaseError(error: PostgrestError): AppError {
  let code: AppErrorCode = AppErrorCode.InternalError
  let severity: AppErrorSeverity = AppErrorSeverity.High
  let retryable = true
  const message = error.message
  let userMessage = '系统繁忙，请稍后重试'

  // PostgreSQL Error Codes
  // https://www.postgresql.org/docs/current/errcodes-appendix.html
  switch (error.code) {
    case '23505': // unique_violation
      code = AppErrorCode.Conflict
      severity = AppErrorSeverity.Medium
      retryable = false
      userMessage = '该记录已存在，请勿重复添加'
      break
    case '23503': // foreign_key_violation
      code = AppErrorCode.ValidationFailed
      severity = AppErrorSeverity.Medium
      retryable = false
      userMessage = '关联数据不存在，无法完成操作'
      break
    case '42501': // insufficient_privilege
      code = AppErrorCode.Forbidden
      severity = AppErrorSeverity.High
      retryable = false
      userMessage = '您没有权限执行此操作'
      break
    case 'PGRST116': // JSON object requested, multiple (or no) rows returned
      code = AppErrorCode.NotFound
      severity = AppErrorSeverity.Low
      retryable = false
      userMessage = '未找到相关记录'
      break
    default:
      // Handle network-like errors from Supabase client if any
      if (message.includes('fetch') || message.includes('network')) {
        code = AppErrorCode.NetworkError
        severity = AppErrorSeverity.Medium
        userMessage = '网络连接出现问题，请检查您的网络连接后重试'
      }
  }

  return createAppError({
    code,
    message: `Database Error: ${error.message}`,
    userMessage,
    severity,
    retryable,
    cause: error,
    context: {
      code: error.code,
      details: error.details,
      hint: error.hint
    }
  })
}

export function fromTRPCClientError(error: TRPCClientError<InferrableClientTypes>): AppError {
  let code: AppErrorCode = AppErrorCode.InternalError
  let severity: AppErrorSeverity = AppErrorSeverity.High
  let retryable = true
  let userMessage = '系统繁忙，请稍后重试'

  // TRPCClientError shape usually contains 'data' with 'code' (e.g. UNAUTHORIZED)
  const data = error.data as { code?: string; httpStatus?: number } | undefined
  const trpcCode = data?.code

  if (trpcCode === 'UNAUTHORIZED') {
    code = AppErrorCode.Unauthenticated
    retryable = false
    userMessage = '身份验证失败，请重新登录'
  } else if (trpcCode === 'FORBIDDEN') {
    code = AppErrorCode.Forbidden
    retryable = false
    userMessage = '您没有权限执行此操作'
  } else if (trpcCode === 'NOT_FOUND') {
    code = AppErrorCode.NotFound
    severity = AppErrorSeverity.Low
    retryable = false
    userMessage = '请求的资源不存在'
  } else if (trpcCode === 'TIMEOUT') {
    code = AppErrorCode.Timeout
    severity = AppErrorSeverity.Medium
    userMessage = '请求超时，请稍后重试'
  } else if (trpcCode === 'BAD_REQUEST') {
    code = AppErrorCode.ValidationFailed
    severity = AppErrorSeverity.Low
    retryable = false
    userMessage = '请求参数错误'
  }

  // Fallback to base classifier but inject TRPC context
  if (code === AppErrorCode.InternalError && !trpcCode) {
     return baseClassifyError(error, {
      isTRPCError: true,
      trpcCode,
      httpStatus: data?.httpStatus
    })
  }
  
  return createAppError({
    code,
    message: error.message,
    userMessage,
    severity,
    retryable,
    cause: error,
    context: {
      isTRPCError: true,
      trpcCode,
      httpStatus: data?.httpStatus
    }
  })
}
