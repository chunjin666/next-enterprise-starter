import { z } from 'zod'

/**
 * 功能开关配置
 *
 * 用于控制功能的启用/禁用状态，支持通过环境变量覆盖
 */

// ============================================================================
// 功能开关 Schema
// ============================================================================

const featureFlagSchema = z.object({
  // AI 集成功能（可选）
  aiIntegration: z.boolean().default(false),
})

// ============================================================================
// 环境变量解析
// ============================================================================

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

// ============================================================================
// 功能开关配置
// ============================================================================

export const featureFlags = featureFlagSchema.parse({
  aiIntegration: parseBoolean(process.env.FEATURE_AI_INTEGRATION, false),
})

// ============================================================================
// 类型导出
// ============================================================================

export type FeatureFlags = z.infer<typeof featureFlagSchema>

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 检查功能是否启用
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature] === true
}

/**
 * 获取所有启用的功能列表
 */
export function getEnabledFeatures(): Array<keyof FeatureFlags> {
  return (Object.keys(featureFlags) as Array<keyof FeatureFlags>).filter(
    (key) => featureFlags[key] === true
  )
}
