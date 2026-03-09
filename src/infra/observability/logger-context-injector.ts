import type { CtxKey } from '@/infra/context/key'

type ContextStore = Map<CtxKey<unknown>, unknown>
type ContextGetter = () => ContextStore | undefined

let getContextStoreImpl: ContextGetter = () => undefined

export function setContextGetter(getter: ContextGetter) {
  getContextStoreImpl = getter
}

export function getLogContext(): Record<string, unknown> {
  const store = getContextStoreImpl()
  if (!store) return {}

  const ctx: Record<string, unknown> = {}
  
  for (const [keyObj, value] of store.entries()) {
    // 只有标记为 loggable 的 key 才会被记录
    if (keyObj.options.loggable) {
      ctx[keyObj.name] = value
    }
  }
  
  return ctx
}
