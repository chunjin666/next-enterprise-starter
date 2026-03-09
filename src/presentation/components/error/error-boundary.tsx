'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { classifyError } from '@/infra/errors/classifier'
import { type AppError } from '@/shared/kernel/errors'
import { getErrorColor } from '@/infra/errors/error-helper'
import * as logger from '@/infra/observability/logger'
import { isLocalhost } from '@/infra/utils/env'
import { AlertTriangle, Clock, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorHandlingOptions {
  enableRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  enableReporting?: boolean
  onError?: (error: AppError) => void
}

/**
 * 增强的错误边界组件
 */
interface EnhancedErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
  options?: ErrorHandlingOptions
  context?: string
}

interface EnhancedErrorBoundaryState {
  hasError: boolean
  error: AppError | null
  retryCount: number
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  private maxRetries: number
  private retryDelay: number

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)

    this.maxRetries = props.options?.maxRetries || 3
    this.retryDelay = props.options?.retryDelay || 1000

    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    const enhancedError = classifyError(error, {
      componentStack: 'Unknown component'
    })

    return {
      hasError: true,
      error: enhancedError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedError = classifyError(error, {
      ...(this.props.context ? { context: this.props.context } : {}),
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.context || 'Unknown Boundary'
    })

    this.setState({ error: enhancedError })

    // 记录错误
    this.logError(enhancedError)

    // 调用自定义错误处理器
    this.props.onError?.(enhancedError)
  }

  private logError = (error: AppError) => {
    // 使用统一的 Logger 记录错误
    logger.error({
      message: error.message,
      code: error.code,
      severity: error.severity,
      context: error.context,
      cause: error.cause,
    }, 'ReactErrorBoundary')
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries && this.state.error?.retryable) {
      setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          retryCount: prevState.retryCount + 1
        }))
      }, this.retryDelay)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误 UI
      return (
        <div className="flex justify-center items-center p-4 min-h-screen bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-900">
                出现了一些问题
              </CardTitle>
              <p className="text-gray-600">
                {this.state.error.userMessage}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 错误详情 */}
              <div className={`p-4 rounded-lg border ${getErrorColor(this.state.error.severity)}`}>
                <div className="flex gap-2 items-center mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    错误代码: {this.state.error.code}
                  </span>
                </div>
                <p className="text-sm">
                  {this.state.error.message}
                </p>
              </div>

              {/* 建议操作 - 移除或保留静态建议 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">您可以尝试：</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                    刷新页面或稍后重试
                  </li>
                  <li className="flex gap-2 items-center">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full"></div>
                    检查您的网络连接
                  </li>
                </ul>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col gap-3 justify-center sm:flex-row">
                {this.state.error.retryable && this.state.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} className="flex gap-2 items-center">
                    <RefreshCw className="w-4 h-4" />
                    重试 ({this.maxRetries - this.state.retryCount} 次剩余)
                  </Button>
                )}
                <Button variant="outline" onClick={this.handleReload}>
                  刷新页面
                </Button>
                <Link href="/">
                  <Button variant="outline" className="flex gap-2 items-center">
                    <Home className="w-4 h-4" />
                    返回首页
                  </Button>
                </Link>
              </div>

              {/* 本地环境详情 */}
              {isLocalhost() && !!this.state.error.cause && (
                <div className="p-4 mt-6 bg-gray-100 rounded-lg">
                  <details>
                    <summary className="mb-2 text-sm font-medium cursor-pointer">
                      本地环境错误详情
                    </summary>
                    <div className="mt-2 text-xs">
                      <div className="mb-2">
                        <strong>错误代码:</strong> {this.state.error.code}
                      </div>
                      <div className="mb-2">
                        <strong>严重程度:</strong> {this.state.error.severity}
                      </div>
                      <div className="mb-2">
                        <strong>原始错误:</strong>
                      </div>
                      <pre className="overflow-auto p-2 max-h-32 whitespace-pre-wrap bg-white rounded border border-subtle">
                        {this.state.error.cause instanceof Error
                          ? this.state.error.cause.stack || this.state.error.cause.message
                          : String(this.state.error.cause)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
