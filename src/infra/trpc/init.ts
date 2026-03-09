import { initTRPC } from '@trpc/server'
import SuperJSON from 'superjson'
import { treeifyError, ZodError } from 'zod'
import { isAppError } from '@/shared/kernel/errors'
import { serializeAppError } from './error-transfer'
import type { Context } from './context'

/**
 * tRPC Meta 扩展
 * 用于定义 Procedure 级别的元数据
 */
export interface Meta {
  disableAutoLog?: boolean
  /** 是否记录请求入参 (注意：请勿记录敏感信息) */
  logInput?: boolean
}

export const t = initTRPC
  .context<Context>()
  .meta<Meta>()
  .create({
    transformer: SuperJSON,
    errorFormatter({ shape, error }) {
      // 提取 AppError 信息 (如果存在)
      const cause = error.cause
      const appError = isAppError(cause) ? cause : null

      return {
        ...shape,
        data: {
          ...shape.data,
          // 保留 Zod 校验错误信息
          zodError: cause instanceof ZodError && cause.name === 'ZodError' ? treeifyError(cause) : null,
          // 透传 AppError 业务错误信息 (使用统一序列化逻辑)
          appError: appError ? serializeAppError(appError) : null,
        },
      }
    },
  })

export const middleware = t.middleware

export const router = t.router

export const mergeRouters = t.mergeRouters
