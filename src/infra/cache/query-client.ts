// QueryClient 配置选项，供客户端组件使用
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // 数据保持新鲜时间：5分钟
      staleTime: 5 * 60 * 1000,
      // 缓存时间：10分钟
      gcTime: 10 * 60 * 1000,
      // 重试配置
      retry: (failureCount: number, error: unknown) => {
        // 对于认证错误不重试
        if (error && typeof error === 'object' && 'status' in error) {
          const maybeStatus = (error as { status?: unknown }).status
          if (typeof maybeStatus === 'number' && (maybeStatus === 401 || maybeStatus === 403)) {
            return false
          }
        }
        // 最多重试2次
        return failureCount < 2
      },
      // 重试延迟
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 窗口重新获得焦点时重新获取数据
      refetchOnWindowFocus: false,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
    },
    mutations: {
      // 变更重试配置
      retry: 1,
      // 变更重试延迟
      retryDelay: 1000,
    },
  },
} as const
