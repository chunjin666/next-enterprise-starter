// @ts-nocheck
// Test setup for vitest

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon'
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'service'
process.env.SUPABASE_INTERNAL_URL ??= 'http://localhost:54321'

process.env.SILICONFLOW_BASE_URL ??= 'http://localhost:3001'
process.env.SILICONFLOW_API_KEY ??= 'key'

process.env.NEXT_PUBLIC_SITE_URL ??= 'https://example.com'
