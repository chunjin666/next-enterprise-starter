import { z } from 'zod'
import { userAuthedProcedure } from '@/infra/trpc/procedures'
import { router } from '@/infra/trpc/init'
import { createClient } from '@/infra/supabase/server-client'
import { provideTodoRepository } from '../container'
import { listTodosUseCase } from '../application/usecases/list-todos'
import { createTodoUseCase } from '../application/usecases/create-todo'
import { toggleTodoUseCase } from '../application/usecases/toggle-todo'
import { deleteTodoUseCase } from '../application/usecases/delete-todo'
import { TodoFilterSchema, CreateTodoInputSchema } from '../domain/todo.model'

export const todosRouter = router({
  list: userAuthedProcedure
    .input(TodoFilterSchema.optional())
    .query(async ({ ctx, input }) => {
      const supabase = await createClient()
      const repo = provideTodoRepository(supabase)
      const result = await listTodosUseCase(repo, ctx.user.id, input)

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      return result.value
    }),

  create: userAuthedProcedure
    .input(CreateTodoInputSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClient()
      const repo = provideTodoRepository(supabase)
      const result = await createTodoUseCase(repo, ctx.user.id, input)

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      return result.value
    }),

  toggleComplete: userAuthedProcedure
    .input(z.object({
      id: z.string().uuid(),
      completed: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const supabase = await createClient()
      const repo = provideTodoRepository(supabase)
      const result = await toggleTodoUseCase(repo, input.id, input.completed)

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      return result.value
    }),

  delete: userAuthedProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ input }) => {
      const supabase = await createClient()
      const repo = provideTodoRepository(supabase)
      const result = await deleteTodoUseCase(repo, input.id)

      if (!result.ok) {
        throw new Error(result.error.message)
      }

      return { success: true }
    }),
})
