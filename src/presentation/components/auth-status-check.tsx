'use client'

import { useAuth } from '@/presentation/context/auth-context'
import { Loader2 } from 'lucide-react'

interface AuthStatusCheckProps {
  children: React.ReactNode
}

export function AuthStatusCheck({ children }: AuthStatusCheckProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">检查认证状态...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">需要登录</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>您需要登录才能访问此功能。</p>
              <div className="mt-3">
                <a
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  前往登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}