import { middleware } from '../init'
import { TRPCError } from '@trpc/server'
import { classifyError } from '@/infra/errors/classifier'
import { AppErrorCode } from '@/shared/kernel/errors'

/**
 * 错误处理中间件
 * 自动捕获下游抛出的错误，并尝试转换为标准的 TRPCError
 */
export const errorHandlerMiddleware = middleware(async ({ next }) => {
  try {
    return await next()
  } catch (err) {
    // 如果已经是 TRPCError，直接抛出
    if (err instanceof TRPCError) {
      throw err
    }

    // 使用统一分类器将错误转换为 AppError
    const appError = classifyError(err)

    // 将 AppErrorCode 映射到 TRPCError code
    let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR'

    switch (appError.code) {
      case AppErrorCode.ValidationFailed:
        code = 'BAD_REQUEST'
        break
      case AppErrorCode.Unauthenticated:
        code = 'UNAUTHORIZED'
        break
      case AppErrorCode.Forbidden:
        code = 'FORBIDDEN'
        break
      case AppErrorCode.NotFound:
        code = 'NOT_FOUND'
        break
      case AppErrorCode.Conflict:
        code = 'CONFLICT'
        break
      case AppErrorCode.Timeout:
        code = 'TIMEOUT'
        break
      case AppErrorCode.InternalError:
      case AppErrorCode.NetworkError:
      case AppErrorCode.Unknown:
      default:
        code = 'INTERNAL_SERVER_ERROR'
        break
    }

    throw new TRPCError({
      code,
      message: appError.message,
      cause: appError.cause,
    })
  }
})
