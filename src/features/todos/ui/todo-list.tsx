'use client'

import { TodoItem } from './todo-item'
import { CreateTodoForm } from './create-todo-form'
import { useTodos } from '../hooks/use-todos'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import type { TodoFilter, Todo } from '../domain/todo.model'

export function TodoList() {
  const [filter, setFilter] = useState<TodoFilter>({})
  const { data: todos, isLoading, isFetching, error } = useTodos(filter)

  // 首次加载显示骨架屏，切换 filter 时保持显示数据（placeholderData）
  const showSkeleton = isLoading && !todos

  if (showSkeleton) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        加载失败: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CreateTodoForm />

      <div className="flex gap-2">
        <button
          onClick={() => setFilter({})}
          className={`px-3 py-1 rounded-md text-sm ${
            filter.completed === undefined ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilter({ completed: false })}
          className={`px-3 py-1 rounded-md text-sm ${
            filter.completed === false ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          未完成
        </button>
        <button
          onClick={() => setFilter({ completed: true })}
          className={`px-3 py-1 rounded-md text-sm ${
            filter.completed === true ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          已完成
        </button>
      </div>

      {/* 切换 filter 时显示加载指示器，但不隐藏数据 */}
      <div className="space-y-2 relative">
        {isFetching && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-full" />
          </div>
        )}
        {todos && todos.length > 0 ? (
          todos.map((todo: Todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无待办事项
          </div>
        )}
      </div>
    </div>
  )
}
