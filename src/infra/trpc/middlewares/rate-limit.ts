import { middleware } from '../init'
import { TRPCError } from '@trpc/server'

type Counter = { count: number; windowStart: number }
type UserCounters = Map<string, Counter>
type ServiceCounter = Counter

function getStore() {
  const g = globalThis as unknown as { __rateLimit?: { users: UserCounters; service: ServiceCounter } }
  if (!g.__rateLimit) {
    g.__rateLimit = { users: new Map(), service: { count: 0, windowStart: Date.now() } }
  }
  return g.__rateLimit
}

function getClientKey(headers: Headers, userId?: string | null) {
  if (userId) return `u:${userId}`
  const xfwd = headers.get('x-forwarded-for') || ''
  const ip = xfwd.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

export const rateLimitMiddleware = middleware(async ({ ctx, next }) => {
  const store = getStore()

  const user = await ctx.supabase.auth.getUser().then(r => r.data.user).catch(() => null)
  const clientKey = getClientKey(ctx.req.headers as unknown as Headers, user?.id ?? null)

  const userLimit = Number(process.env.RATE_LIMIT_USER_PER_MIN ?? 120)
  const serviceLimit = Number(process.env.RATE_LIMIT_SERVICE_PER_MIN ?? 1000)
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)

  const now = Date.now()

  if (now - store.service.windowStart >= windowMs) {
    store.service.windowStart = now
    store.service.count = 0
  }
  store.service.count += 1
  if (store.service.count > serviceLimit) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'service_rate_limited' })
  }

  const u = store.users.get(clientKey) ?? { count: 0, windowStart: now }
  if (now - u.windowStart >= windowMs) {
    u.windowStart = now
    u.count = 0
  }
  u.count += 1
  store.users.set(clientKey, u)
  if (u.count > userLimit) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'user_rate_limited' })
  }

  return next()
})