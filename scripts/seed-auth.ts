import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED || '0'

const envFile = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf-8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const idx = line.indexOf('=')
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!url || !serviceKey) {
  console.error('missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, serviceKey)

async function ensureUser(email: string, password: string) {
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = users.data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (existing) return existing
  const res = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (res.error || !res.data.user) {
    console.error('createUser failed', res.error)
    process.exit(1)
  }
  return res.data.user
}


async function getShanghaiCityId(): Promise<number> {
  const { data, error } = await admin
    .from('cities')
    .select('id')
    .eq('name_zh', '上海')
    .eq('type', 'city')
    .single()
  
  if (error || !data) {
    // 如果中文名没找到，尝试英文名
    const { data: dataEn, error: errorEn } = await admin
      .from('cities')
      .select('id')
      .eq('name_en', 'Shanghai')
      .eq('type', 'city')
      .single()
    
    if (errorEn || !dataEn) {
      console.error('无法找到上海的城市ID')
      process.exit(1)
    }
    return dataEn.id
  }
  
  return data.id
}

async function upsertJobPreferences(userId: string) {
  const shanghaiId = await getShanghaiCityId()
  
  const { error } = await admin.from('job_preferences').upsert({
    user_id: userId,
    titles: ['前端', 'frontend', 'react'],
    employment_types: ['full_time'],
    remote_policies: ['hybrid', 'yes'],
    city_ids: [shanghaiId],
    salary_unit: 'monthly',
    currency: 'CNY',
  })
  if (error) {
    console.error('upsert job_preferences failed', error)
    process.exit(1)
  }
}

async function main() {
  const user1 = await ensureUser('tester1@example.com', 'Password123!')
  await upsertJobPreferences(user1.id)
  const user2 = await ensureUser('tester2@example.com', 'Password123!')
  await upsertJobPreferences(user2.id)
  console.log('seed-auth done:', user1.id, user2.id)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})