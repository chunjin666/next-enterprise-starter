/**
 * 对象工具函数 - 类型安全的对象操作
 * 遵循类型驱动开发原则，提供完整的类型推导和安全性
 */

/**
 * 从对象中选择指定的属性
 * @param obj 源对象
 * @param keys 要选择的属性键数组
 * @returns 包含指定属性的新对象
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 从对象中排除指定的属性
 * @param obj 源对象
 * @param keys 要排除的属性键数组
 * @returns 排除指定属性后的新对象
 * @example
 * omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

/**
 * 检查对象是否为空（没有可枚举属性）
 * @param obj 要检查的对象
 * @returns 如果对象为空返回 true，否则返回 false
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0
}

/**
 * 深度合并两个对象，后面的对象会覆盖前面的同名属性
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的新对象
 */
export function deepMerge<T extends Record<string, unknown>, S extends Record<string, unknown>>(
  target: T, 
  source: S
): T & S {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = { ...target } as any
  
  for (const key in source) {
    if (source[key] !== undefined) {
      const sourceValue = source[key]
      const targetValue = result[key]
      
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>)
      } else {
        result[key] = sourceValue
      }
    }
  }
  
  return result
}

/**
 * 创建对象的浅拷贝
 * @param obj 要拷贝的对象
 * @returns 新的对象
 */
export function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (Array.isArray(obj)) {
    return [...obj] as unknown as T
  }
  
  return { ...obj }
}

/**
 * 比较两个对象是否相等（浅比较）
 * @param a 第一个对象
 * @param b 第二个对象
 * @returns 如果相等返回 true，否则返回 false
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  const keysA = Object.keys(a as Record<string, unknown>)
  const keysB = Object.keys(b as Record<string, unknown>)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) return false
  }
  
  return true
}

/**
 * 获取对象的指定路径值
 * @param obj 源对象
 * @param path 属性路径，使用点号分隔
 * @param defaultValue 默认值
 * @returns 路径对应的值或默认值
 * @example
 * get({ user: { name: 'John' } }, 'user.name') // 'John'
 * get({ user: { name: 'John' } }, 'user.age', 0) // 0
 */
export function get<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = result[key] as Record<string, unknown>
  }
  
  return result !== undefined ? result as T : (defaultValue as T)
}

/**
 * 设置对象的指定路径值
 * @param obj 目标对象
 * @param path 属性路径，使用点号分隔
 * @param value 要设置的值
 * @returns 修改后的对象
 * @example
 * set({}, 'user.name', 'John') // { user: { name: 'John' } }
 */
export function set<T extends Record<string, unknown>>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.')
  const result = clone(obj)
  let current: Record<string, unknown> = result
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || current[key] == null || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
  
  current[keys[keys.length - 1]] = value
  return result
}

/**
 * 过滤对象属性
 * @param obj 源对象
 * @param predicate 过滤函数，返回 true 保留该属性
 * @returns 过滤后的新对象
 * @example
 * filter({ a: 1, b: 2, c: 3 }, (key, value) => value > 1) // { b: 2, c: 3 }
 */
export function filter<T extends object>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> {
  const result = {} as Partial<T>
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(key, obj[key])) {
      result[key] = obj[key]
    }
  }
  
  return result
}

/**
 * 映射对象值
 * @param obj 源对象
 * @param mapper 映射函数
 * @returns 映射后的新对象
 * @example
 * mapValues({ a: 1, b: 2 }, (value) => value * 2) // { a: 2, b: 4 }
 */
export function mapValues<T extends object, R>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = mapper(obj[key], key)
    }
  }
  
  return result
}

/**
 * 获取对象的所有键值对数组
 * @param obj 源对象
 * @returns 键值对数组
 * @example
 * entries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function entries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

/**
 * 从键值对数组创建对象
 * @param entries 键值对数组
 * @returns 新对象
 * @example
 * fromEntries([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 */
export function fromEntries<K extends string | number | symbol, V>(
  entries: Array<[K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>
}