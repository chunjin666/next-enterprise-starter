export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

/**
 * 辅助函数：从 Result 中获取值，如果是错误则抛出异常
 * 仅用于必须要抛出异常的场景（如顶层边界）
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value
  }
  throw result.error
}
