import { setContext } from '@/infra/context'
import { CurrentUserIdKey } from '@/infra/context/keys'
import { TRPCError } from '@trpc/server'
import { t } from './init'
import { errorHandlerMiddleware } from './middlewares/error-handler'
import { loggerMiddleware } from './middlewares/logger'

// 基础 Procedure：自动注入日志中间件和错误处理中间件
export const baseProcedure = t.procedure
  .use(loggerMiddleware)
  .use(errorHandlerMiddleware)

export const userAuthedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const { supabase } = ctx
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  // 将 userId 注入到 ALS Context 中，以便 Logger 自动捕获
  setContext(CurrentUserIdKey, user.id)

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})
