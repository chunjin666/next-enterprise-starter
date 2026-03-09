import { createTRPCContext } from '@/infra/trpc/context'
import { appRouter } from '../root'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import * as logger from '@/infra/observability/logger'
import { runWithContext, setContext } from '@/infra/context'
import { RequestIdKey } from '@/infra/context/keys'
import { getRequestIdFromHeaders, createRequestId } from '@/infra/utils/request-id'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import type { TRPCRequestInfo } from '@trpc/server/unstable-core-do-not-import'

/**
 * tRPC API 路由处理器
 * 
 * 处理所有 /api/trpc/* 的请求
 * 支持 GET 和 POST 方法
 */
const handler = (req: Request) =>
  runWithContext(() => {
    // 1. 注入 Request ID
    const requestId = getRequestIdFromHeaders(req.headers) || createRequestId()
    setContext(RequestIdKey, requestId)

    // 2. 处理请求
    return fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: () => createTRPCContext({ 
        req: req as unknown as CreateNextContextOptions['req'], 
        res: {} as unknown as CreateNextContextOptions['res'],
        info: {} as unknown as TRPCRequestInfo
      }),
      responseMeta({ errors, type, ctx }) {
        if (errors && errors.length > 0) {
          return { status: 500, headers: { 'Cache-Control': 'no-store' } }
        }
        if (type !== 'query') {
          return { headers: { 'Cache-Control': 'no-store' } }
        }
        const cc = ctx!.cacheControl
        return { headers: { 'Cache-Control': cc || 'no-store' } }
      },
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
              logger.error({ path: path ?? '<no-path>', message: error.message }, 'trpc_adapter_error')
            }
          : undefined,
    })
  })

export { handler as GET, handler as POST }
