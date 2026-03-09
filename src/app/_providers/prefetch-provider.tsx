'use client'

import { PrefetchContext, type PrefetchHandlersMap } from '@/presentation/context/prefetch-context'

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  // 清空业务 handlers，模板中无预加载需求
  const handlers: PrefetchHandlersMap = {}

  return (
    <PrefetchContext.Provider value={handlers}>
      {children}
    </PrefetchContext.Provider>
  )
}
