import type { IncomingHttpHeaders } from 'node:http'
import type { NextRequest } from 'next/server'

export function getRequestIdFromHeaders(headers: IncomingHttpHeaders | Headers): string | undefined {
  const _headers = headers instanceof Headers ? headers : new Headers(headers as Record<string, string>)
  return _headers.get('x-request-id') || undefined
}

export function getRequestId(request: NextRequest): string | undefined {
  return getRequestIdFromHeaders(request.headers)
}

export function createRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}