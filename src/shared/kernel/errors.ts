// 1. 错误码常量 (Single Source of Truth)
export const AppErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED', // 参数错误
  Unauthenticated: 'UNAUTHENTICATED', // 未登录
  Forbidden: 'FORBIDDEN', // 无权限
  NotFound: 'NOT_FOUND', // 资源不存在
  Conflict: 'CONFLICT', // 资源冲突
  InternalError: 'INTERNAL_ERROR', // 系统内部错误 (DB/Code)
  NetworkError: 'NETWORK_ERROR', // 网络问题
  Timeout: 'TIMEOUT', // 超时
  Unknown: 'UNKNOWN', // 未知
} as const

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode]

// 2. 严重程度常量
export const AppErrorSeverity = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
} as const

export type AppErrorSeverity = (typeof AppErrorSeverity)[keyof typeof AppErrorSeverity]

// 3. 核心错误接口
export interface AppError {
  readonly _tag: 'AppError' // Discriminator

  // 机器可读标识
  code: AppErrorCode

  // 开发者调试信息 (English, Technical)
  message: string

  // 用户展示信息 (Chinese, Friendly) - 必填
  userMessage: string

  // UI 表现控制
  severity: AppErrorSeverity
  retryable: boolean

  // 原始堆栈/错误 (不序列化到前端，仅 Log)
  cause?: unknown

  // 结构化上下文 (用于 Sentry/Logs)
  context?: Record<string, unknown>
}

export const createAppError = (params: Omit<AppError, '_tag'>): AppError => ({
  _tag: 'AppError',
  ...params,
})

export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    (error as { _tag?: unknown })._tag === 'AppError'
  )
}

/**
 * 安全地从任意错误对象中提取可读消息
 * 优先使用 AppError.userMessage
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.userMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'Unknown error'
}
