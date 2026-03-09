'use client'

import { useState } from 'react'
import { useCreateTodo } from '../hooks/use-todos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function CreateTodoForm() {
  const [title, setTitle] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const createMutation = useCreateTodo()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    createMutation.mutate(
      { title: title.trim(), priority: 'medium' },
      {
        onSuccess: () => {
          setTitle('')
          setIsExpanded(false)
        },
      }
    )
  }

  if (!isExpanded) {
    return (
      <Button onClick={() => setIsExpanded(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        添加待办事项
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入待办事项标题..."
        autoFocus
        disabled={createMutation.isPending}
        className="flex-1"
      />
      <Button type="submit" disabled={!title.trim() || createMutation.isPending}>
        {createMutation.isPending ? '创建中...' : '添加'}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setIsExpanded(false)
          setTitle('')
        }}
      >
        取消
      </Button>
    </form>
  )
}
