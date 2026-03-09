import { AppErrorCode, createAppError } from '@/shared/kernel/errors'

/**
 * Todo 相关错误定义
 */

export const todoNotFoundError = (id: string) =>
  createAppError({
    code: AppErrorCode.NotFound,
    message: `待办事项不存在: ${id}`,
    userMessage: '待办事项不存在',
    severity: 'low',
    retryable: false,
    context: { todoId: id },
  })

export const todoAlreadyCompletedError = (id: string) =>
  createAppError({
    code: AppErrorCode.Conflict,
    message: '该待办事项已完成',
    userMessage: '该待办事项已完成',
    severity: 'low',
    retryable: false,
    context: { todoId: id },
  })

export const todoNotCompletedError = (id: string) =>
  createAppError({
    code: AppErrorCode.Conflict,
    message: '该待办事项未完成，无法取消完成',
    userMessage: '该待办事项未完成',
    severity: 'low',
    retryable: false,
    context: { todoId: id },
  })

export const todoTitleEmptyError = () =>
  createAppError({
    code: AppErrorCode.ValidationFailed,
    message: '待办事项标题不能为空',
    userMessage: '待办事项标题不能为空',
    severity: 'low',
    retryable: false,
  })
