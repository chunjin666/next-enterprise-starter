import { createAppError, AppErrorCode, AppErrorSeverity, type AppError } from '@/shared/kernel/errors'

export function baseClassifyError(error: unknown, context?: Record<string, unknown>): AppError {
  let code: AppErrorCode = AppErrorCode.Unknown
  let severity: AppErrorSeverity = AppErrorSeverity.Medium
  let retryable = true
  let message: string
  let cause: unknown = error

  if (typeof error === 'string') {
    message = error
    const lowerMsg = message.toLowerCase()
    if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) {
      code = AppErrorCode.NetworkError
      severity = AppErrorSeverity.Medium
    } else if (lowerMsg.includes('timeout')) {
      code = AppErrorCode.Timeout
      severity = AppErrorSeverity.Medium
    } else if (lowerMsg.includes('404') || lowerMsg.includes('not found')) {
      code = AppErrorCode.NotFound
      severity = AppErrorSeverity.Low
      retryable = false
    } else if (lowerMsg.includes('401') || lowerMsg.includes('unauthorized')) {
      code = AppErrorCode.Unauthenticated
      severity = AppErrorSeverity.High
      retryable = false
    } else if (lowerMsg.includes('403') || lowerMsg.includes('forbidden')) {
      code = AppErrorCode.Forbidden
      severity = AppErrorSeverity.High
      retryable = false
    } else if (lowerMsg.includes('500') || lowerMsg.includes('server error')) {
      code = AppErrorCode.InternalError
      severity = AppErrorSeverity.High
    }
  } else if (error instanceof Error) {
    message = error.message
    cause = error
    const lowerMsg = message.toLowerCase()
    // Simple heuristics for common errors
    if (lowerMsg.includes('network') || lowerMsg.includes('fetch')) {
      code = AppErrorCode.NetworkError
    } else if (lowerMsg.includes('abort')) {
      code = AppErrorCode.Timeout
    }
  } else {
    message = String(error)
  }

  return createAppError({
    code,
    message,
    userMessage: getUserMessage(code),
    severity,
    retryable,
    cause,
    context
  })
}

function getUserMessage(code: AppErrorCode): string {
  switch (code) {
    case AppErrorCode.NetworkError:
      return '网络连接出现问题，请检查您的网络连接后重试'
    case AppErrorCode.ValidationFailed:
      return '输入的数据格式不正确，请检查后重新提交'
    case AppErrorCode.Unauthenticated:
      return '身份验证失败，请重新登录'
    case AppErrorCode.Forbidden:
      return '您没有权限执行此操作'
    case AppErrorCode.NotFound:
      return '请求的资源不存在'
    case AppErrorCode.InternalError:
      return '服务器出现错误，我们正在努力修复'
    case AppErrorCode.Timeout:
      return '请求超时，请稍后重试'
    case AppErrorCode.Conflict:
      return '资源冲突，请检查数据状态'
    case AppErrorCode.Unknown:
    default:
      return '出现未知错误，请稍后重试或联系客服'
  }
}
