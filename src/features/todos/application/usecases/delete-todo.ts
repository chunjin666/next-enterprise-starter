import type { TodoRepository } from '../ports/todo-repository'
import type { Result } from '@/shared/kernel/result'
import type { AppError } from '@/shared/kernel/errors'
import { ok, err } from '@/shared/kernel/result'
import { AppErrorCode, createAppError } from '@/shared/kernel/errors'
import { todoNotFoundError } from '../../domain/todo.errors'

/**
 * 删除待办事项用例
 */
export async function deleteTodoUseCase(
  repo: TodoRepository,
  id: string
): Promise<Result<void, AppError>> {
  // 检查 todo 是否存在
  const existingTodo = await repo.getById(id)
  if (!existingTodo) {
    return err(todoNotFoundError(id))
  }

  try {
    await repo.delete(id)
    return ok(undefined)
  } catch (error) {
    return err(
      createAppError({
        code: AppErrorCode.InternalError,
        message: '删除待办事项失败',
        userMessage: '删除待办事项失败，请稍后重试',
        severity: 'medium',
        retryable: true,
        cause: error instanceof Error ? error : undefined,
      })
    )
  }
}
