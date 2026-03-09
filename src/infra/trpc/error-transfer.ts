import { type AppError, type AppErrorCode, type AppErrorSeverity, createAppError } from '@/shared/kernel/errors'
import type { TRPCClientErrorLike } from '@trpc/client'

/**
 * 传输用的 AppError 数据结构 (DTO)
 * 仅包含可序列化的字段，去除函数和不可序列化的 cause/context
 */
export interface AppErrorDTO {
  code: AppErrorCode
  message: string
  userMessage: string
  severity: AppErrorSeverity
  retryable: boolean
}

/**
 * [Server Side] 序列化：将 AppError 转换为 DTO
 * 用于 tRPC errorFormatter
 */
export function serializeAppError(error: AppError): AppErrorDTO {
  return {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    severity: error.severity,
    retryable: error.retryable,
  }
}

/**
 * [Client Side] 反序列化：从 tRPC 错误中恢复 AppError
 * 会重新创建 AppError 实例，确保类型安全
 */
export function restoreAppError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: TRPCClientErrorLike<{ errorShape: { data: { appError: Partial<AppErrorDTO> | null } }; transformer: any }>
): AppError | null {
  // 1. 基础防御性检查
  if (typeof error !== 'object' || error === null) {
    return null
  }

  // 2. 尝试定位 data.appError
  // 兼容 tRPC Client Error 结构
  const data = error.data
  if (!data || typeof data !== 'object') {
    return null
  }

  const dto = data.appError
  if (!dto) {
    return null
  }

  // 3. 验证必要字段 (运行时校验)
  // 确保恢复出来的对象至少包含核心业务字段
  if (typeof dto.code !== 'string' || typeof dto.userMessage !== 'string' || typeof dto.severity !== 'string') {
    return null
  }

  // 4. 重建 AppError 实例
  // 这里不直接 cast，而是使用工厂函数创建新对象
  return createAppError({
    code: dto.code as AppErrorCode,
    message: dto.message || 'Unknown error from server',
    userMessage: dto.userMessage,
    severity: dto.severity as AppErrorSeverity,
    retryable: Boolean(dto.retryable),
    // 将原始错误保留在 cause 中，便于调试
    cause: error,
  })
}
