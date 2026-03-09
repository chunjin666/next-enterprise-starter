import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_APP_DIR = path.join(ROOT, 'src', 'app')
const LEGACY_APP_DIR = path.join(ROOT, 'app')
const TARGET_DIR = fs.existsSync(SRC_APP_DIR) ? SRC_APP_DIR : LEGACY_APP_DIR
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git'])
const VALID_CLIENT_ENV_PREFIX = 'NEXT_PUBLIC_'

type Issue = { file: string; message: string }

function isCodeFile(file: string) {
  return /\.(tsx?|jsx?)$/.test(file)
}

async function readFile(file: string) {
  return fs.promises.readFile(file, 'utf8')
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(full)
    } else if (isCodeFile(full)) {
      yield full
    }
  }
}

function isClientModule(content: string) {
  return /(^|\n)\s*['"]use client['"];?/.test(content)
}

function checkEnvUsage(file: string, content: string): Issue[] {
  const issues: Issue[] = []
  const regex = /process\.env\.([A-Z0-9_]+)/g
  let match: RegExpExecArray | null
  const client = isClientModule(content)
  while ((match = regex.exec(content))) {
    const key = match[1]
    if (client && !key.startsWith(VALID_CLIENT_ENV_PREFIX)) {
      issues.push({ file, message: `Client module uses server-only env '${key}'. Only ${VALID_CLIENT_ENV_PREFIX}* are allowed in client.` })
    }
  }
  return issues
}

function checkServerClientImport(file: string, content: string): Issue[] {
  const issues: Issue[] = []
  const client = isClientModule(content)
  if (!client) return issues
  if (/from\s+['"]@\/app\/_lib\/supabase\/server-client['"]/.test(content) || /server-client\.ts/.test(content)) {
    issues.push({ file, message: `Client module imports Supabase server-client. Use browser-client on client side.` })
  }
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(content)) {
    issues.push({ file, message: `Client module references SUPABASE_SERVICE_ROLE_KEY which must remain server-only.` })
  }
  return issues
}

async function run() {
  const issues: Issue[] = []
  try {
    for await (const file of walk(TARGET_DIR)) {
      const content = await readFile(file)
      issues.push(...checkEnvUsage(file, content))
      issues.push(...checkServerClientImport(file, content))
    }
  } catch (e) {
    console.error('[secrets-check] failed to scan files:', e)
    process.exit(1)
  }

  if (issues.length > 0) {
    console.error('\nSecrets / module boundary violations found:')
    for (const i of issues) {
      console.error(`- ${path.relative(ROOT, i.file)}: ${i.message}`)
    }
    console.error('\nFix the above issues. Only NEXT_PUBLIC_* envs are allowed in client modules; server-client and SERVICE_ROLE keys must stay server-side.')
    process.exit(1)
  } else {
    console.log('[secrets-check] OK: no client-side secret or server-client usage found.')
  }
}

run()