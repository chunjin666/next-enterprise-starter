import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database'
import type { TodoRepository } from '../../application/ports/todo-repository'
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from '../../domain/todo.model'
import { toDomain, toInsert, toUpdate, filterToQuery } from '../mappers/todo.mapper'

/**
 * 创建 Todo 仓储实现
 */
export function createTodoRepository(supabase: SupabaseClient<Database>): TodoRepository {
  return {
    async list(userId: string, filter?: TodoFilter): Promise<Todo[]> {
      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // 应用过滤条件
      const conditions = filterToQuery(filter)
      Object.entries(conditions).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value as string | boolean)
        }
      })

      const { data, error } = await query

      if (error) {
        throw error
      }

      return data.map(toDomain)
    },

    async getById(id: string): Promise<Todo | null> {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data ? toDomain(data) : null
    },

    async create(userId: string, input: CreateTodoInput): Promise<Todo> {
      const insert = toInsert(userId, input)

      const { data, error } = await supabase
        .from('todos')
        .insert(insert)
        .select()
        .single()

      if (error) {
        throw error
      }

      return toDomain(data)
    },

    async update(id: string, input: Partial<UpdateTodoInput>): Promise<Todo> {
      const update = toUpdate(input)

      const { data, error } = await supabase
        .from('todos')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return toDomain(data)
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }
    },
  }
}
