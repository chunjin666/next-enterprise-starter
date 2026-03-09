'use client'

import { useTRPC } from '@/app/_providers/trpc-provider'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TodoFilter, CreateTodoInput, Todo } from '../domain/todo.model'
import { createTodoAction, toggleTodoAction, deleteTodoAction } from '../api/todo.actions'

/**
 * 获取待办事项列表
 * 使用 placeholderData 保持切换 filter 时的平滑过渡，避免闪烁
 */
export function useTodos(filter?: TodoFilter) {
  const trpc = useTRPC()

  return useQuery({
    ...trpc.todos.list.queryOptions(filter),
    placeholderData: keepPreviousData,
  })
}

/**
 * 获取所有 todos.list 相关的查询键前缀
 * 用于匹配所有 filter 变体的查询
 */
function getTodosQueryKeyPrefix(trpc: ReturnType<typeof useTRPC>) {
  return trpc.todos.list.queryKey()
}

/**
 * 创建待办事项
 */
export function useCreateTodo() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const result = await createTodoAction(input)
      if (!result.ok) throw new Error(result.error.userMessage)
      return result.value
    },
    onMutate: async (newTodo) => {
      // 获取 todos.list 的基础 queryKey（用于前缀匹配）
      const queryKeyPrefix = getTodosQueryKeyPrefix(trpc)

      // 取消所有进行中的 todos 查询
      await queryClient.cancelQueries({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      // 获取所有匹配的查询数据，用于回滚
      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      // 乐观添加新待办
      const optimisticTodo: Todo = {
        id: crypto.randomUUID(),
        userId: '',
        title: newTodo.title,
        description: newTodo.description ?? null,
        completed: false,
        priority: newTodo.priority ?? 'medium',
        dueDate: newTodo.dueDate ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 更新所有匹配的查询
      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<Todo[]>(queryKey, (old) => {
          if (!old) return [optimisticTodo]
          return [optimisticTodo, ...old]
        })
      })

      return { previousQueries, queryKeyPrefix }
    },
    onError: (error, _variables, context) => {
      // 回滚所有受影响的查询
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(`创建失败: ${error.message}`)
    },
    onSuccess: () => {
      // invalidate 所有 todos 相关查询
      queryClient.invalidateQueries({
        queryKey: getTodosQueryKeyPrefix(trpc),
        exact: false,
      })
      toast.success('待办事项创建成功')
    },
  })
}

/**
 * 切换待办事项完成状态
 */
export function useToggleTodo() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const result = await toggleTodoAction(id, completed)
      if (!result.ok) throw new Error(result.error.userMessage)
      return result.value
    },
    onMutate: async ({ id, completed }) => {
      const queryKeyPrefix = getTodosQueryKeyPrefix(trpc)

      await queryClient.cancelQueries({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      // 乐观更新所有匹配的查询
      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<Todo[]>(queryKey, (old) => {
          if (!old) return old
          return old.map((todo) =>
            todo.id === id ? { ...todo, completed } : todo
          )
        })
      })

      return { previousQueries, queryKeyPrefix }
    },
    onError: (error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(`更新失败: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTodosQueryKeyPrefix(trpc),
        exact: false,
      })
    },
  })
}

/**
 * 删除待办事项
 */
export function useDeleteTodo() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTodoAction(id)
      if (!result.ok) throw new Error(result.error.userMessage)
      return result.value
    },
    onMutate: async (id) => {
      const queryKeyPrefix = getTodosQueryKeyPrefix(trpc)

      await queryClient.cancelQueries({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      const previousQueries = queryClient.getQueriesData<Todo[]>({
        queryKey: queryKeyPrefix,
        exact: false,
      })

      // 乐观删除所有匹配的查询中的目标项
      previousQueries.forEach(([queryKey]) => {
        queryClient.setQueryData<Todo[]>(queryKey, (old) => {
          if (!old) return old
          return old.filter((todo) => todo.id !== id)
        })
      })

      return { previousQueries, queryKeyPrefix }
    },
    onError: (error, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error(`删除失败: ${error.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getTodosQueryKeyPrefix(trpc),
        exact: false,
      })
    },
  })
}
