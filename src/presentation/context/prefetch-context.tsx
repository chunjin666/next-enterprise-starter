'use client'

import { createContext, useContext } from 'react'

export interface PrefetchHandler {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export type PrefetchHandlersMap = Record<string, PrefetchHandler>

export const PrefetchContext = createContext<PrefetchHandlersMap>({})

export function usePrefetchContext() {
  return useContext(PrefetchContext)
}

export function usePrefetchHandler(path: string) {
  const context = usePrefetchContext()
  return context[path] || {}
}
