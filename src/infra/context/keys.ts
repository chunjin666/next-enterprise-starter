import { createCtxKey } from './key'

/**
 * 全局请求 ID
 */
export const RequestIdKey = createCtxKey<string>('requestId', { 
  loggable: true,
  description: 'Unique identifier for the request'
})

/**
 * 当前用户 ID
 */
export const CurrentUserIdKey = createCtxKey<string>('userId', { 
  loggable: true,
  description: 'Authenticated user ID'
})

/**
 * 分布式追踪 ID
 */
export const TraceIdKey = createCtxKey<string>('traceId', { 
  loggable: true,
  description: 'Distributed trace ID'
})

/**
 * tRPC 路径
 */
export const TrpcPathKey = createCtxKey<string>('trpcPath', { 
  loggable: true,
  description: 'tRPC procedure path'
})

/**
 * tRPC 类型 (query/mutation)
 */
export const TrpcTypeKey = createCtxKey<string>('trpcType', { 
  loggable: true,
  description: 'tRPC procedure type'
})
