import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from '../../domain/todo.model'

/**
 * Todo 仓储接口
 *
 * 定义数据访问的抽象接口，遵循依赖倒置原则
 */
export interface TodoRepository {
  /**
   * 获取用户的待办事项列表
   */
  list(userId: string, filter?: TodoFilter): Promise<Todo[]>

  /**
   * 根据 ID 获取待办事项
   */
  getById(id: string): Promise<Todo | null>

  /**
   * 创建待办事项
   */
  create(userId: string, input: CreateTodoInput): Promise<Todo>

  /**
   * 更新待办事项
   */
  update(id: string, input: Partial<UpdateTodoInput>): Promise<Todo>

  /**
   * 删除待办事项
   */
  delete(id: string): Promise<void>
}
