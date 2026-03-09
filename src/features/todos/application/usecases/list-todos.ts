import type { TodoRepository } from '../ports/todo-repository'
import type { Todo, TodoFilter } from '../../domain/todo.model'
import type { Result } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'
import { ok, err } from '@/shared/kernel/result'
import { AppErrorCode, createAppError } from '@/shared/kernel/errors'

/**
 * 列出待办事项用例
 */
export async function listTodosUseCase(
  repo: TodoRepository,
  userId: string,
  filter?: TodoFilter
): Promise<Result<Todo[], AppError>> {
  try {
    const todos = await repo.list(userId, filter)
    return ok(todos)
  } catch (error) {
    return err(
      createAppError({
        code: AppErrorCode.InternalError,
        message: '获取待办事项列表失败',
        userMessage: '获取待办事项列表失败，请稍后重试',
        severity: 'medium',
        retryable: true,
        cause: error instanceof Error ? error : undefined,
      })
    )
  }
}
