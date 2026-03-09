import { AsyncLocalStorage } from 'node:async_hooks'
import { setContextGetter } from '@/infra/observability/logger-context-injector'
import type { CtxKey } from './key'

// 导出 CtxKey 方便使用
export { type CtxKey, createCtxKey } from './key'
export * from './keys'

// 内部存储结构
type ContextStore = Map<CtxKey<unknown>, unknown>

// 全局 ALS 实例
const als = new AsyncLocalStorage<ContextStore>()

/**
 * 初始化一个新的 Context 并运行回调
 */
export function runWithContext<T>(callback: () => T): T {
  const store = new Map<CtxKey<unknown>, unknown>()
  return als.run(store, callback)
}

/**
 * 获取当前 Context Store (仅限内部或高级使用)
 */
export function getContextStore(): ContextStore | undefined {
  return als.getStore()
}

/**
 * 设置 Context 值 (类型安全)
 */
export function setContext<T>(key: CtxKey<T>, value: T): void {
  const store = als.getStore()
  if (store) {
    store.set(key as CtxKey<unknown>, value)
  }
}

/**
 * 获取 Context 值 (类型安全)
 */
export function getContext<T>(key: CtxKey<T>): T | undefined {
  const store = als.getStore()
  const value = store?.get(key as CtxKey<unknown>)
  
  if (value === undefined) {
    return key.options.defaultValue
  }
  
  return value as T
}

// 注入 Logger Context Getter
// 当服务端加载此模块时，自动注册 Getter
setContextGetter(() => als.getStore())
