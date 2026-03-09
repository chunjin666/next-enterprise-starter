import { toSnakeCase } from '@/infra/utils/case-converter'
import { logger } from '@/infra/observability/logger'

/**
 * 需要进行字段名转换的参数类型
 */
const CONVERTIBLE_PARAMS = {
  // 直接字段名参数（过滤器）
  FIELD_NAME: /^[a-zA-Z][a-zA-Z0-9]*$/,
  // 排序参数
  ORDER: 'order',
  // 选择字段参数
  SELECT: 'select',
  // 其他可能需要转换的参数
  COLUMNS: 'columns',
} as const

const COMPOSITE_FILTER_PARAMS = ['or', 'and', 'not'] as const

type CompositeParam = (typeof COMPOSITE_FILTER_PARAMS)[number]

function isCompositeParamName(name: string): name is CompositeParam {
  return (COMPOSITE_FILTER_PARAMS as readonly string[]).includes(name)
}

/**
 * 调试模式
 */
const DEBUG_MODE =
  typeof window !== 'undefined'
    ? ('__SUPABASE_DEBUG__' in window ? (window as { __SUPABASE_DEBUG__?: boolean }).__SUPABASE_DEBUG__ ?? false : false)
    : process.env.SUPABASE_DEBUG === 'true'

/**
 * 调试日志函数
 */
function debugLog(message: string, data?: unknown) {
  if (DEBUG_MODE) {
    if (data === undefined) {
      logger.debug(`[SmartURL] ${message}`)
      return
    }
    logger.debug({ data }, `[SmartURL] ${message}`)
  }
}

/**
 * 判断参数名是否需要进行字段名转换
 */
function shouldConvertParameter(paramName: string): boolean {
  // 排除系统参数和操作符参数
  const systemParams = ['limit', 'offset', 'count', 'head', 'apikey']
  if (systemParams.includes(paramName)) {
    return false
  }

  // 排除已经是snake_case的参数
  if (paramName.includes('_')) {
    return false
  }

  // 检查是否为需要转换的参数类型
  return (
    paramName === CONVERTIBLE_PARAMS.ORDER ||
    paramName === CONVERTIBLE_PARAMS.SELECT ||
    paramName === CONVERTIBLE_PARAMS.COLUMNS ||
    isCompositeParamName(paramName) ||
    CONVERTIBLE_PARAMS.FIELD_NAME.test(paramName)
  )
}

/**
 * 转换参数值中的字段名
 */
function convertParameterValue(paramName: string, value: string): string {
  switch (paramName) {
    case CONVERTIBLE_PARAMS.ORDER:
      return convertOrderValue(value)
    case CONVERTIBLE_PARAMS.SELECT:
      return convertSelectValue(value)
    case CONVERTIBLE_PARAMS.COLUMNS:
      return convertColumnsValue(value)
    default:
      if (isCompositeParamName(paramName)) {
        return convertFilterValue(value)
      }
      return value
  }
}

/**
 * 转换order参数值：created_at.desc,updated_at.asc
 */
function convertOrderValue(value: string): string {
  return value.replace(/([a-zA-Z][a-zA-Z0-9]*)/g, match => {
    // 保留排序方向关键字
    if (/^(asc|desc)$/i.test(match)) {
      return match
    }
    // 转换字段名
    return toSnakeCase(match)
  })
}

/**
 * 转换select参数值：id,userName,createdAt
 */
function convertSelectValue(value: string): string {
  return value
    .split(',')
    .map(field => {
      const trimmed = field.trim()
      // 处理嵌套选择和函数调用
      if (trimmed.includes('(') || trimmed.includes('.') || trimmed.includes(':')) {
        return trimmed // 复杂表达式暂不处理
      }
      // 简单字段名转换
      return /^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed) ? toSnakeCase(trimmed) : trimmed
    })
    .join(',')
}

/**
 * 转换columns参数值
 */
function convertColumnsValue(value: string): string {
  return value
    .split(',')
    .map(field => {
      const trimmed = field.trim().replace(/"/g, '') // 移除引号
      return `"${toSnakeCase(trimmed)}"` // 重新添加引号
    })
    .join(',')
}

/**
 * 转换复合过滤表达式中的字段名（用于 or 参数值）
 * 规则：在 ( 或 , 之后，匹配到形如 <field>. 的字段名并转换为 snake_case
 * 示例：createdAt.lt.123 → created_at.lt.123
 */
function convertFilterValue(value: string): string {
  return value.replace(/(^|[,(])([a-zA-Z][a-zA-Z0-9]*)\.(?=[a-zA-Z])/g, (_match, prefix: string, field: string) => {
    return `${prefix}${toSnakeCase(field)}.`
  })
}

/**
 * 创建智能URL代理
 */
export function createSmartURL(originalUrl: URL): URL {
  const smartUrl = new URL(originalUrl.toString())

  // 保存原始的searchParams方法
  const originalSet = smartUrl.searchParams.set.bind(smartUrl.searchParams)
  const originalAppend = smartUrl.searchParams.append.bind(smartUrl.searchParams)

  // 代理set方法
  smartUrl.searchParams.set = function (name: string, value: string) {
    try {
      if (shouldConvertParameter(name)) {
        // 转换参数名（如果是直接字段名）
        const convertedName = CONVERTIBLE_PARAMS.FIELD_NAME.test(name) ? toSnakeCase(name) : name
        // 转换参数值中的字段名
        const convertedValue = convertParameterValue(name, value)
        debugLog(`Parameter conversion: ${name}=${value} → ${convertedName}=${convertedValue}`)
        return originalSet(convertedName, convertedValue)
      }
      return originalSet(name, value)
    } catch (error) {
      logger.warn({ error, name }, '[SmartURL] Parameter conversion failed, using original values')
      return originalSet(name, value)
    }
  }

  // 代理append方法
  smartUrl.searchParams.append = function (name: string, value: string) {
    try {
      if (shouldConvertParameter(name)) {
        const convertedName = CONVERTIBLE_PARAMS.FIELD_NAME.test(name) ? toSnakeCase(name) : name
        const convertedValue = convertParameterValue(name, value)
        debugLog(`Parameter append: ${name}=${value} → ${convertedName}=${convertedValue}`)
        return originalAppend(convertedName, convertedValue)
      }
      return originalAppend(name, value)
    } catch (error) {
      logger.warn({ error, name }, '[SmartURL] Parameter append failed, using original values')
      return originalAppend(name, value)
    }
  }

  return smartUrl
}
