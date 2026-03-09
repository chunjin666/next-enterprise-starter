import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database'
import type { TodoRepository } from './application/ports/todo-repository'
import { createTodoRepository } from './infrastructure/repositories/todo.repository'

/**
 * 依赖注入容器
 *
 * 提供各层组件的创建和注入
 */

/**
 * 提供 Todo 仓储实例
 */
export function provideTodoRepository(supabase: SupabaseClient<Database>): TodoRepository {
  return createTodoRepository(supabase)
}
