import { toCamelCase, toSnakeCase } from '../utils/case-converter'
import { createSmartURL } from './smart-url'

// Recursive function to convert keys in an object or an array of objects
// 函数重载：支持不同的使用方式
export function deepTransformKeys<T>(data: T, transform: (key: string) => string): T
export function deepTransformKeys<T, R>(data: T, transform: (key: string) => string): R
export function deepTransformKeys<T, R = T>(data: T, transform: (key: string) => string): R {
  if (Array.isArray(data)) {
    return data.map(item => deepTransformKeys(item, transform)) as R
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const newObj: Record<string, unknown> = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[transform(key)] = deepTransformKeys(data[key], transform)
      }
    }
    return newObj as R
  }
  return data as unknown as R
}

// Custom fetch function that handles request/response transformation
export function createTransformingFetch(originalFetch: typeof fetch) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    let body = init?.body

    const extBase = process.env.NEXT_PUBLIC_SUPABASE_URL
    const intBase = process.env.SUPABASE_INTERNAL_URL

    // 服务端环境：始终使用内部 URL（HTTP）避免 SSL 证书验证问题
    // SUPABASE_INTERNAL_URL 仅在服务端可用，客户端为 undefined
    if (extBase && intBase) {
      const current = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      // 标准化 URL：将 127.0.0.1 替换为 localhost
      const normalizedCurrent = current.replace('127.0.0.1', 'localhost')
      const normalizedExtBase = extBase.replace('127.0.0.1', 'localhost')

      if (normalizedCurrent.startsWith(normalizedExtBase)) {
        const ext = new URL(normalizedCurrent)
        const int = new URL(intBase.replace('127.0.0.1', 'localhost'))
        const rewritten = `${int.origin}${ext.pathname}${ext.search}`
        url = rewritten
        input = rewritten
      }
    }

    // Skip transformation for auth-related requests to preserve Supabase auth functionality
    const isAuthRequest = url.includes('/auth/')
    const isRestRequest = url.includes('/rest/')

    if (isAuthRequest) {
      // For auth requests, use original fetch without any transformation
      return await originalFetch(input, init)
    }

    // Only apply transformations to REST API requests (database operations)
    if (!isRestRequest) {
      return await originalFetch(input, init)
    }

    // Transform request body for POST/PATCH requests (only for non-auth requests)
    if (body && typeof body === 'string' && init?.headers) {
      const contentType =
        init.headers instanceof Headers
          ? init.headers.get('content-type')
          : Array.isArray(init.headers)
            ? init.headers.find(([key]) => key.toLowerCase() === 'content-type')?.[1]
            : typeof init.headers === 'object'
              ? (init.headers as Record<string, string>)['content-type'] ||
                (init.headers as Record<string, string>)['Content-Type']
              : null

      if (contentType?.includes('application/json')) {
        try {
          const parsedBody = JSON.parse(body)
          const transformedBody = deepTransformKeys(parsedBody, toSnakeCase)
          body = JSON.stringify(transformedBody)
        } catch {
          // If parsing fails, keep original body
        }
      }
    }

    // Apply smart URL proxy for automatic parameter conversion to all REST requests
    if (isRestRequest) {
      const urlObj = new URL(url)

      // Convert existing URL parameters that are already in the URL
      // The smartUrl proxy only intercepts new parameter setting, not existing ones
      const existingParams = Array.from(urlObj.searchParams.entries())

      // Create smart URL with empty parameters
      const emptyUrl = new URL(urlObj.origin + urlObj.pathname)
      const smartUrl = createSmartURL(emptyUrl)

      // Re-add all parameters through the smart proxy to ensure conversion
      existingParams.forEach(([key, value]) => {
        smartUrl.searchParams.set(key, value)
      })

      url = smartUrl.toString()
    }

    // Make the request with transformed data
    const response = await originalFetch(url, {
      ...init,
      body,
    })

    // Transform response data (only for non-auth requests)
    const originalJson = response.json.bind(response)
    response.json = async () => {
      const data = await originalJson()
      return deepTransformKeys(data, toCamelCase)
    }

    // Transform response data by intercepting text() method
    // Supabase internally uses JSON.parse(body) instead of response.json()
    const originalText = response.text.bind(response)
    response.text = async () => {
      const body = await originalText()
      if ((body && body.trim().startsWith('{')) || body.trim().startsWith('[')) {
        try {
          const data = JSON.parse(body)
          const transformedData = deepTransformKeys(data, toCamelCase)
          return JSON.stringify(transformedData)
        } catch {
          // If JSON parsing fails, return original body
          return body
        }
      }
      return body
    }

    return response
  }
}