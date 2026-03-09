import { z } from 'zod'

// ============================================================================
// 🎯 架构决策记录 (Architecture Decision Record)
// ============================================================================
/**
 * 我们采用了 "Unified Cursor Protocol" (统一游标协议) 来屏蔽底层的分页实现差异。
 *
 * 核心概念：
 * 1. **Envelope (信封)**: `PaginationCursorBased`
 *    - 这是**API 响应的标准接口**。
 *    - 前端只认这个结构，不关心底层是 Offset 还是 Keyset。
 *    - 核心字段是 `nextCursor` (Opaque String)。
 *
 * 2. **Token (令牌)**: `PageCursor` (Unified Cursor)
 *    - 这是 `nextCursor` 字符串内部的**实际载荷**。
 *    - 这是一个 Base64 编码的 JSON，包含 `t` (时间戳), `i` (ID), `o` (偏移量)。
 *    - 它是完全透明的 (Opaque)：前端不应该解析它，只应该透传。
 *
 * 3. **Legacy (遗留/特定场景)**: `PaginationOffsetBased`
 *    - 仅用于**管理后台表格**等必须显示 "第几页" 的场景。
 *    - **严禁**用于 C 端无限流 (Feed) 接口。
 *
 * 🔄 关系图：
 * [Client] <--- (nextCursor string) --- [API Response (PaginationCursorBased)]
 *                                              |
 *                                          (decodes to)
 *                                              v
 *                                     [Unified Cursor Payload]
 *                                     /          \
 *                                 (Search)      (Recommend)
 *                               Keyset Logic    Offset Logic
 */

// ============================================================================
// 1. Core Schemas (Contracts)
// ============================================================================

/**
 * 基于游标的分页 Schema (The Envelope)
 *
 * 适用于无限滚动、实时数据流等场景
 * 特点：性能高，适合大数据集，但不支持跳页
 */
export const PaginationCursorBasedSchema = z.object({
  // Navigation
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().nullable(),
  previousCursor: z.string().nullable(),

  // Meta
  totalCount: z.number().int().min(0).optional(),
})

/**
 * 基于偏移量的分页 Schema (Legacy/Admin Table)
 *
 * 适用于传统分页、支持跳页的场景
 * 特点：支持跳转到任意页面，但大数据集时性能较差
 */
export const PaginationOffsetBasedSchema = z.object({
  // Navigation
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),

  // Meta
  totalCount: z.number().int().min(0),
})

// ============================================================================
// 2. Core Types
// ============================================================================

export type PaginationCursorBased = z.infer<typeof PaginationCursorBasedSchema>
export type PaginationOffsetBased = z.infer<typeof PaginationOffsetBasedSchema>

// ============================================================================
// 3. Unified Cursor Protocol (The Token)
// ============================================================================

/**
 * 游标编解码器工厂 (Functional Style)
 *
 * @param schema Zod Schema 用于验证和类型推导
 * @returns 包含 encode 和 decode 函数的对象
 */
export const createCursorCodec = <T>(schema: z.ZodType<T>) => {
  return {
    /**
     * 将数据编码为 Base64 字符串
     */
    encode: (data: T): string => {
      try {
        const jsonStr = JSON.stringify(data)
        return Buffer.from(jsonStr).toString('base64')
      } catch (e) {
        console.error('Failed to encode cursor:', e)
        return ''
      }
    },

    /**
     * 解码 Base64 字符串为强类型数据
     */
    decode: (cursorStr: string | null | undefined): T | null => {
      if (!cursorStr) return null
      if (cursorStr.trim() === '') return null

      try {
        const jsonStr = Buffer.from(cursorStr, 'base64').toString('utf-8')
        const raw = JSON.parse(jsonStr)
        const parsed = schema.safeParse(raw)

        if (parsed.success) {
          return parsed.data
        }
        return null
      } catch {
        return null
      }
    },
  }
}

// --- Standard Schemas (常用游标定义) ---

/**
 * 1. 时间戳游标 (适用于 Feed 流)
 * 格式: { t: string, i: string }
 */
export const TimestampCursorSchema = z.object({
  t: z.string().describe('Timestamp (ISO string or numerical string)'),
  i: z.string().describe('Unique ID (Tie-breaker)'),
})

/**
 * 2. 偏移量游标 (适用于兼容模式)
 * 格式: { o: number, l: number }
 */
export const OffsetCursorSchema = z.object({
  o: z.number().int().min(0).describe('Offset'),
  l: z.number().int().min(1).optional().describe('Limit'),
})

/**
 * 3. 搜索/相关性游标 (适用于搜索引擎)
 * 格式: { s: number, i: string }
 */
export const SearchCursorSchema = z.object({
  s: z.number().describe('Score/Relevance'),
  i: z.string().describe('Unique ID'),
})

// --- Pre-defined Codecs (预定义实例) ---

export const TimestampCursor = createCursorCodec(TimestampCursorSchema)
export const OffsetCursor = createCursorCodec(OffsetCursorSchema)
export const SearchCursor = createCursorCodec(SearchCursorSchema)

// ============================================================================
// 4. Response Interfaces & Helpers
// ============================================================================

// --- Interfaces ---

export interface PaginatedCursorBasedResponse<T> {
  data: T[]
  meta: PaginationCursorBased
}

export interface PaginatedOffsetBasedResponse<T> {
  data: T[]
  meta: PaginationOffsetBased
}

// --- Zod Helpers ---

export const createCursorBasedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationCursorBasedSchema,
  })

export const createOffsetBasedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationOffsetBasedSchema,
  })

// ============================================================================
// 5. Utility Functions (Calculators)
// ============================================================================

/**
 * 计算基于偏移量的分页元数据
 */
export function calculateOffsetPagination(
  page: number,
  limit: number,
  total: number
): PaginationOffsetBased {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    totalCount: total,
  }
}

/**
 * 构造基于游标的分页元数据
 */
export function createCursorPagination(
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  nextCursor: string | null = null,
  previousCursor: string | null = null,
  totalCount?: number
): PaginationCursorBased {
  return {
    hasNextPage,
    hasPreviousPage,
    nextCursor,
    previousCursor,
    totalCount,
  }
}

// ============================================================================
// 6. Configuration & Inputs
// ============================================================================

export interface CursorBasedPaginationInput {
  cursor?: string
  limit?: number
}

export interface OffsetBasedPaginationInput {
  page?: number
  limit?: number
}

export const PaginationStrategy = {
  Cursor: 'cursor',
  Offset: 'offset',
} as const

export type PaginationStrategy = (typeof PaginationStrategy)[keyof typeof PaginationStrategy]

export interface PaginationOptions {
  defaultLimit?: number
  maxLimit?: number
  strategy?: PaginationStrategy
}

export const DEFAULT_PAGINATION_CONFIG: Required<PaginationOptions> = {
  defaultLimit: 20,
  maxLimit: 100,
  strategy: PaginationStrategy.Cursor,
}

export function createPaginationConfig(options?: PaginationOptions) {
  return {
    ...DEFAULT_PAGINATION_CONFIG,
    ...options,
  }
}
