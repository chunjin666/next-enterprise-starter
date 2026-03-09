import { TodoList } from '@/features/todos/mod'
import { AuthStatusCheck } from '@/presentation/components/auth-status-check'

export default function TodosPage() {
  return (
    <AuthStatusCheck>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">待办事项</h1>
        <TodoList />
      </div>
    </AuthStatusCheck>
  )
}
