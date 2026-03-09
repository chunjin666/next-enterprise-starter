/**
 * Case conversion utilities for database field names
 */

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

/**
 * Convert object keys from snake_case to camelCase recursively
 */
export function objectToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(item => objectToCamelCase(item))
  }

  if (typeof obj === 'object' && (obj as Record<string, unknown>).constructor === Object) {
    const input = obj as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[toCamelCase(key)] = objectToCamelCase(input[key])
      }
    }
    return result
  }

  return obj
}

/**
 * Convert object keys from camelCase to snake_case recursively
 */
export function objectToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(item => objectToSnakeCase(item))
  }

  if (typeof obj === 'object' && (obj as Record<string, unknown>).constructor === Object) {
    const input = obj as Record<string, unknown>
    const result: Record<string, unknown> = {}
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        result[toSnakeCase(key)] = objectToSnakeCase(input[key])
      }
    }
    return result
  }

  return obj
}
