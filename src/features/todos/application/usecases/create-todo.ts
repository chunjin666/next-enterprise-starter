import type { TodoRepository } from '../ports/todo-repository'
import type { Todo, CreateTodoInput } from '../../domain/todo.model'
import type { Result } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'
import { ok, err } from '@/shared/kernel/result'
import { AppErrorCode, createAppError } from '@/shared/kernel/errors'
import { todoTitleEmptyError } from '../../domain/todo.errors'

/**
 * 创建待办事项用例
 */
export async function createTodoUseCase(
  repo: TodoRepository,
  userId: string,
  input: CreateTodoInput
): Promise<Result<Todo, AppError>> {
  // 验证标题非空
  if (!input.title || input.title.trim() === '') {
    return err(todoTitleEmptyError())
  }

  try {
    const todo = await repo.create(userId, input)
    return ok(todo)
  } catch (error) {
    return err(
      createAppError({
        code: AppErrorCode.InternalError,
        message: '创建待办事项失败',
        userMessage: '创建待办事项失败，请稍后重试',
        severity: 'medium',
        retryable: true,
        cause: error instanceof Error ? error : undefined,
      })
    )
  }
}
