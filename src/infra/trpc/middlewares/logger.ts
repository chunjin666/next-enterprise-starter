import { middleware } from '../init'
import { logger } from '@/infra/observability/logger'
import { TRPCError } from '@trpc/server'

export const loggerMiddleware = middleware(async (opts) => {
  const { path, type, next, meta, input } = opts
  
  // tRPC middleware runs before input validation when attached to baseProcedure.
  // In this case, 'input' is undefined, but 'getRawInput' allows access to the original input.
  // We use getRawInput as a fallback to ensure we log the incoming parameters.
  let rawInput: unknown;
  try {
    // @ts-ignore - getRawInput is available in newer tRPC versions but might be missing from types
    if (typeof opts.getRawInput === 'function') {
      // @ts-ignore
      rawInput = await opts.getRawInput();
    }
  } catch (_e) {
    // Ignore error if getRawInput fails
  }
  
  // 检查是否禁用自动日志
  if (meta?.disableAutoLog) {
    return next()
  }

  const start = Date.now()
  
  const actualInput = input ?? rawInput
  
  // 准备用于日志的 Input
  // 使用解构赋值创建浅拷贝，避免直接修改(mutate)原始对象带来的副作用
  let loggableInput = actualInput
  if (actualInput && typeof actualInput === 'object' && !Array.isArray(actualInput)) {
    // 'direction' 是 useInfiniteQuery 注入的字段 (forward/backward)，业务逻辑不需要，在日志中排除
    if ('direction' in actualInput) {
      const { direction: _ignore, ...rest } = actualInput as Record<string, unknown>
      loggableInput = rest
    }
  }

  // 1. 记录请求开始 (Start)
  // 有助于排查请求卡死或进程崩溃问题
  // 注意：requestId 和 userId 会通过 logger 的 mixin 自动注入
  const startMeta: Record<string, unknown> = { path, type }
  if (meta?.logInput && loggableInput !== undefined) {
    startMeta.input = loggableInput
  }
  logger.info(startMeta, `tRPC ${path} START`)

  try {
    // 执行下一个中间件/Procedure
    const result = await next()
    
    const durationMs = Date.now() - start
    const status = result.ok ? 'OK' : 'ERROR'
    
    // 构造日志元数据
    const logMeta: Record<string, unknown> = {
      path,
      type,
      durationMs,
      // 如果是错误，记录错误信息
      error: !result.ok ? result.error : undefined,
    }

    // 如果配置了 logInput 且 input 存在，则记录
    if (meta?.logInput && loggableInput !== undefined) {
      logMeta.input = loggableInput
    }

    // 根据结果状态选择日志级别
    if (result.ok) {
      logger.info(logMeta, `tRPC ${path} ${status}`)
    } else {
      logger.error(logMeta, `tRPC ${path} ${status}`)
    }

    return result
  } catch (err) {
    const durationMs = Date.now() - start
    
    // 如果是 TRPCError，说明是预期的业务错误，记录为 ERROR 或 WARN
    if (err instanceof TRPCError) {
      const isInternal = err.code === 'INTERNAL_SERVER_ERROR'
      const logMeta = { path, type, durationMs, error: err }
      
      if (meta?.logInput && loggableInput !== undefined) {
        Object.assign(logMeta, { input: loggableInput })
      }

      if (isInternal) {
        logger.error(logMeta, `tRPC ${path} ERROR`)
      } else {
        // 业务错误 (如 BAD_REQUEST, NOT_FOUND) 通常不需要 ERROR 级别
        logger.warn(logMeta, `tRPC ${path} ${err.code}`)
      }
      throw err
    }

    // 捕获非预期的中间件错误 (next() 抛出异常)
    logger.error({ path, type, durationMs, error: err }, `tRPC ${path} PANIC`)
    throw err
  }
})
