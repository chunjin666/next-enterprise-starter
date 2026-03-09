import { z } from 'zod'

const clientEnvSchema = z.object({
  siteUrl: z.string().url(),
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string().min(1),
  }),
})

export const clientEnv = clientEnvSchema.parse({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
})

/**
 * 获取站点 URL
 * - 客户端：返回空字符串（使用相对路径）
 * - 服务端：返回配置的站点 URL
 */
export function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  return clientEnv.siteUrl
}
