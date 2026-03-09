import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from '../../domain/todo.model'
import type { Database } from '@/shared/types/database'

type TodoRow = Database['public']['Tables']['todos']['Row']
type TodoInsert = Database['public']['Tables']['todos']['Insert']
type TodoUpdate = Database['public']['Tables']['todos']['Update']

/**
 * 将数据库行转换为领域模型
 */
export function toDomain(row: TodoRow): Todo {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    priority: row.priority as Todo['priority'],
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * 将创建输入转换为数据库插入格式
 */
export function toInsert(userId: string, input: CreateTodoInput): TodoInsert {
  return {
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority ?? 'medium',
    due_date: input.dueDate ?? null,
    completed: false,
  }
}

/**
 * 将更新输入转换为数据库更新格式
 */
export function toUpdate(input: Partial<UpdateTodoInput>): TodoUpdate {
  const update: TodoUpdate = {}

  if (input.title !== undefined) update.title = input.title
  if (input.description !== undefined) update.description = input.description
  if (input.completed !== undefined) update.completed = input.completed
  if (input.priority !== undefined) update.priority = input.priority
  if (input.dueDate !== undefined) update.due_date = input.dueDate

  return update
}

/**
 * 将过滤器转换为查询条件
 */
export function filterToQuery(filter?: TodoFilter): Record<string, unknown> {
  const conditions: Record<string, unknown> = {}

  if (filter?.completed !== undefined) {
    conditions.completed = filter.completed
  }
  if (filter?.priority !== undefined) {
    conditions.priority = filter.priority
  }

  return conditions
}
