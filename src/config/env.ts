/**
 * 环境变量配置
 *
 * 用法：
 * - 服务端：直接访问 `env.VARIABLE_NAME`
 * - 客户端：仅可访问 `NEXT_PUBLIC_*` 前缀变量
 *
 * 参考 CLAUDE.md：环境变量仅通过此文件访问，禁止 `process.env` 直接访问
 */

import 'server-only'
import { z } from 'zod'

// ============================================================================
// Supabase 配置
// ============================================================================

const supabaseSchema = z.object({
  url: z.string().url(),
  anonKey: z.string().min(1),
  serviceRoleKey: z.string().min(1),
  internalUrl: z.string().url(),
})

// ============================================================================
// AI 服务配置（可选）
// ============================================================================

const siliconFlowSchema = z.object({
  baseUrl: z.string().url().optional(),
  apiKey: z.string().min(1).optional(),
})

// ============================================================================
// 站点配置
// ============================================================================

const siteSchema = z.object({
  url: z.string().url(),
})

// ============================================================================
// 验证与导出
// ============================================================================

const envSchema = z.object({
  supabase: supabaseSchema,
  siliconFlow: siliconFlowSchema,
  site: siteSchema,
})

const rawEnv = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    internalUrl: process.env.SUPABASE_INTERNAL_URL!,
  },
  siliconFlow: {
    baseUrl: process.env.SILICONFLOW_BASE_URL || undefined,
    apiKey: process.env.SILICONFLOW_API_KEY || undefined,
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL!,
  },
}

export const env = envSchema.parse(rawEnv)
