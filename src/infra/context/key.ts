/**
 * Context Key 定义
 * 用于强类型地访问 Context
 */
export interface CtxKeyOptions<T> {
  /** 是否允许记录到日志中 */
  loggable?: boolean
  /** 默认值 */
  defaultValue?: T
  /** 描述 */
  description?: string
}

export interface CtxKey<T> {
  readonly key: symbol
  readonly name: string
  readonly options: CtxKeyOptions<T>
}

/**
 * 创建一个 Context Key
 * 
 * @param name Key 的名称，用于日志和调试
 * @param options 配置选项
 */
export function createCtxKey<T>(name: string, options: CtxKeyOptions<T> = {}): CtxKey<T> {
  return {
    name,
    key: Symbol(name),
    options
  }
}
