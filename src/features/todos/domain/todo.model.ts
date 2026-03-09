import { z } from 'zod'

// ============================================================================
// 枚举定义
// ============================================================================

export const TodoPriorityValues = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const

export type TodoPriority = (typeof TodoPriorityValues)[keyof typeof TodoPriorityValues]

// ============================================================================
// 领域 Schema
// ============================================================================

export const TodoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  completed: z.boolean(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateTodoInputSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255),
  description: z.string().max(2000).nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.string().datetime().nullable().optional(),
})

export const UpdateTodoInputSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

export const TodoFilterSchema = z.object({
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
})

// ============================================================================
// 类型派生
// ============================================================================

export type Todo = z.infer<typeof TodoSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>
export type TodoFilter = z.infer<typeof TodoFilterSchema>
