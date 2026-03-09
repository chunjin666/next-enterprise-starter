import type { TodoRepository } from '../ports/todo-repository'
import type { Todo } from '../../domain/todo.model'
import type { Result } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'
import { ok, err } from '@/shared/kernel/result'
import { AppErrorCode, createAppError } from '@/shared/kernel/errors'
import { todoNotFoundError, todoAlreadyCompletedError, todoNotCompletedError } from '../../domain/todo.errors'

/**
 * 切换待办事项完成状态用例
 */
export async function toggleTodoUseCase(
  repo: TodoRepository,
  id: string,
  completed: boolean
): Promise<Result<Todo, AppError>> {
  // 获取现有 todo
  const existingTodo = await repo.getById(id)
  if (!existingTodo) {
    return err(todoNotFoundError(id))
  }

  // 检查状态是否已经是目标状态
  if (existingTodo.completed === completed) {
    return err(completed ? todoAlreadyCompletedError(id) : todoNotCompletedError(id))
  }

  try {
    const updatedTodo = await repo.update(id, { completed })
    return ok(updatedTodo)
  } catch (error) {
    return err(
      createAppError({
        code: AppErrorCode.InternalError,
        message: '更新待办事项状态失败',
        userMessage: '更新待办事项状态失败，请稍后重试',
        severity: 'medium',
        retryable: true,
        cause: error instanceof Error ? error : undefined,
      })
    )
  }
}
