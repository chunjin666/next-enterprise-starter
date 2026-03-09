import type { Todo } from '../domain/todo.model'
import { useToggleTodo, useDeleteTodo } from '../hooks/use-todos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const toggleMutation = useToggleTodo()
  const deleteMutation = useDeleteTodo()

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800',
  }

  const priorityLabels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  }

  const handleToggle = () => {
    toggleMutation.mutate({ id: todo.id, completed: !todo.completed })
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个待办事项吗？')) {
      deleteMutation.mutate(todo.id)
    }
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border ${
        todo.completed ? 'bg-muted/50' : 'bg-background'
      }`}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        disabled={toggleMutation.isPending}
      />

      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            todo.completed ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-sm text-muted-foreground truncate">
            {todo.description}
          </p>
        )}
        {todo.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            截止日期: {todo.dueDate}
          </p>
        )}
      </div>

      <Badge className={priorityColors[todo.priority]}>
        {priorityLabels[todo.priority]}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="text-muted-foreground hover:text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
