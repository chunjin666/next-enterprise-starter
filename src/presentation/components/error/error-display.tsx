'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/utils'
import type { AppError } from '@/shared/kernel/errors'
import { getErrorColor, getErrorIcon } from '@/infra/errors/error-helper'
import { RefreshCw } from 'lucide-react'

interface ErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * 通用错误显示组件
 * 用于展示 AppError 类型的标准化错误信息
 */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className
}: ErrorDisplayProps) {
  const Icon = getErrorIcon(error.code)
  const colorClass = getErrorColor(error.severity)

  return (
    <Alert className={cn(colorClass, className)}>
      <Icon className="w-4 h-4" />
      <AlertTitle>{error.userMessage}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.message}</p>

        <div className="flex gap-2">
          {error.retryable && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1 w-3 h-3" />
              重试
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              关闭
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
