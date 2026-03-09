import { describe, it, expect } from 'vitest'
import {
  TodoSchema,
  CreateTodoInputSchema,
  UpdateTodoInputSchema,
  TodoFilterSchema,
} from './todo.model'

describe('TodoSchema', () => {
  it('验证有效的 Todo 数据', () => {
    const validTodo = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      title: '测试待办事项',
      description: '这是一个描述',
      completed: false,
      priority: 'medium',
      dueDate: '2024-12-31T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    const result = TodoSchema.safeParse(validTodo)
    expect(result.success).toBe(true)
  })

  it('拒绝空的标题', () => {
    const invalidTodo = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      title: '',
      description: null,
      completed: false,
      priority: 'medium',
      dueDate: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    const result = TodoSchema.safeParse(invalidTodo)
    expect(result.success).toBe(false)
  })

  it('拒绝无效的优先级', () => {
    const invalidTodo = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      title: '测试',
      description: null,
      completed: false,
      priority: 'invalid',
      dueDate: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }

    const result = TodoSchema.safeParse(invalidTodo)
    expect(result.success).toBe(false)
  })
})

describe('CreateTodoInputSchema', () => {
  it('验证有效的创建输入', () => {
    const validInput = {
      title: '新待办事项',
      description: '描述',
      priority: 'high',
    }

    const result = CreateTodoInputSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe('high')
    }
  })

  it('使用默认优先级', () => {
    const input = { title: '测试' }
    const result = CreateTodoInputSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.priority).toBe('medium')
    }
  })

  it('拒绝空的标题', () => {
    const input = { title: '' }
    const result = CreateTodoInputSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})

describe('UpdateTodoInputSchema', () => {
  it('允许部分更新', () => {
    const input = { completed: true }
    const result = UpdateTodoInputSchema.safeParse(input)
    expect(result.success).toBe(true)
  })
})

describe('TodoFilterSchema', () => {
  it('验证有效的过滤器', () => {
    const filter = { completed: false, priority: 'high' }
    const result = TodoFilterSchema.safeParse(filter)
    expect(result.success).toBe(true)
  })

  it('允许空过滤器', () => {
    const result = TodoFilterSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
