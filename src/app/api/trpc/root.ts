import { router } from '@/infra/trpc/init'
import { todosRouter } from '@/features/todos/api/todos.trpc'

export const appRouter = router({
  todos: todosRouter,
})

export type AppRouter = typeof appRouter
