'use server'

import { withAuthenticatedUser } from '@/infra/server-actions/with-auth'
import { createClient } from '@/infra/supabase/server-client'
import { provideTodoRepository } from '../container'
import { createTodoUseCase } from '../application/usecases/create-todo'
import { toggleTodoUseCase } from '../application/usecases/toggle-todo'
import { deleteTodoUseCase } from '../application/usecases/delete-todo'
import type { CreateTodoInput } from '../domain/todo.model'

/**
 * 创建待办事项 Server Action
 */
export async function createTodoAction(input: CreateTodoInput) {
  return withAuthenticatedUser(async ({ userId }) => {
    const supabase = await createClient()
    const repo = provideTodoRepository(supabase)
    return createTodoUseCase(repo, userId, input)
  })
}

/**
 * 切换待办事项完成状态 Server Action
 */
export async function toggleTodoAction(id: string, completed: boolean) {
  return withAuthenticatedUser(async () => {
    const supabase = await createClient()
    const repo = provideTodoRepository(supabase)
    return toggleTodoUseCase(repo, id, completed)
  })
}

/**
 * 删除待办事项 Server Action
 */
export async function deleteTodoAction(id: string) {
  return withAuthenticatedUser(async () => {
    const supabase = await createClient()
    const repo = provideTodoRepository(supabase)
    return deleteTodoUseCase(repo, id)
  })
}
