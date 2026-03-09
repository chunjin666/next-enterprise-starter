'use client'

import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useCallback, useRef, useEffect } from 'react'

export type PrefetchTask = () => Promise<void>

export interface PrefetchOptions {
  /** 用于去重和缓存检查的 Key */
  key: QueryKey
  /** 预加载执行任务 */
  task: PrefetchTask
  /** 数据新鲜度 (ms) - 默认 5分钟 */
  staleTime?: number
  /** Hover 触发延迟 (ms) - 默认 200ms */
  triggerDelay?: number
  /** 是否启用 */
  enabled?: boolean
  auto?: boolean
}

/**
 * 通用预加载 Hook
 * 提供手动触发、Hover 触发和自动触发能力
 */
export function usePrefetch({
  key,
  task,
  staleTime = 5 * 60 * 1000,
  triggerDelay = 200,
  enabled = true,
  auto = false,
}: PrefetchOptions) {
  const queryClient = useQueryClient()
  const timerRef = useRef<NodeJS.Timeout>(null)

  // 核心执行逻辑
  const execute = useCallback(async () => {
    if (!enabled) return

    // 1. 检查缓存状态 (Smart Check)
    const queryState = queryClient.getQueryState(key)
    const isStale = queryState ? Date.now() - queryState.dataUpdatedAt > staleTime : true

    if (!isStale) {
      if (process.env.NODE_ENV === 'development') {
        // console.debug(`[Prefetch] Skipped cached: ${JSON.stringify(key)}`)
      }
      return
    }
    
    try {
      await task()
      if (process.env.NODE_ENV === 'development') {
        // console.debug(`[Prefetch] Executed: ${JSON.stringify(key)}`)
      }
    } catch (err) {
      console.error(`[Prefetch] Failed: ${JSON.stringify(key)}`, err)
    }
  }, [task, enabled, key, queryClient, staleTime])

  useEffect(() => {
    if (auto) {
      execute()
    }
  }, [auto, execute])

  // Hover 触发器 (带防抖)
  const prefetchOnHover = {
    onMouseEnter: () => {
      if (!enabled) return
      timerRef.current = setTimeout(execute, triggerDelay)
    },
    onMouseLeave: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    },
  }

  return {
    execute,
    prefetchOnHover,
  }
}
