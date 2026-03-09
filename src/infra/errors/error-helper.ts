'use client'

import { AlertTriangle, Database, Shield, WifiOff } from 'lucide-react'
import { AppErrorCode, AppErrorSeverity } from '@/shared/kernel/errors'

export function getErrorIcon(code: AppErrorCode) {
  switch (code) {
    case AppErrorCode.NetworkError:
    case AppErrorCode.Timeout:
      return WifiOff
    case AppErrorCode.Unauthenticated:
    case AppErrorCode.Forbidden:
      return Shield
    case AppErrorCode.InternalError:
      return Database
    case AppErrorCode.NotFound:
    case AppErrorCode.ValidationFailed:
    case AppErrorCode.Conflict:
      return AlertTriangle
    default:
      return AlertTriangle
  }
}

export function getErrorColor(severity: AppErrorSeverity) {
  switch (severity) {
    case AppErrorSeverity.Low:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case AppErrorSeverity.Medium:
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case AppErrorSeverity.High:
      return 'text-red-600 bg-red-50 border-red-200'
    case AppErrorSeverity.Critical:
      return 'text-red-800 bg-red-100 border-red-300'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}
