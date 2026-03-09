import { middleware } from '../init'

export type CacheOptions =
  | { type: 'no-store' }
  | { type: 'swr'; sMaxage: number; swr: number }

export function cacheControl(options: CacheOptions) {
  const header =
    options.type === 'no-store'
      ? 'no-store'
      : `s-maxage=${options.sMaxage}, stale-while-revalidate=${options.swr}`

  return middleware(async ({ ctx, next }) => {
    ctx.cacheControl = header
    return next({ ctx })
  })
}

export function cacheNoStore() {
  return cacheControl({ type: 'no-store' })
}

export function cacheSWR(sMaxage?: number, swr?: number) {
  const s = Number(process.env.TRPC_CACHE_SMAXAGE ?? 120)
  const w = Number(process.env.TRPC_CACHE_SWR ?? 60)
  return cacheControl({ type: 'swr', sMaxage: sMaxage ?? s, swr: swr ?? w })
}