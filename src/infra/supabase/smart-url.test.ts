import { describe, it, expect } from 'vitest'
import { createSmartURL } from './smart-url'

describe('smart-url filter value conversion', () => {
  it('converts field names inside or() value to snake_case', () => {
    const base = new URL('https://localhost:44321/rest/v1/job_details')
    const smart = createSmartURL(base)

    const t = '2025-12-10T09:26:01.881787+00:00'
    const i = '00000000-0000-0000-0000-000000000000'

    smart.searchParams.set('or', `createdAt.lt.${t},and(createdAt.eq.${t},id.lt.${i})`)

    const orValue = smart.searchParams.get('or') || ''
    expect(orValue).toContain('created_at.lt.')
    expect(orValue).toContain('and(created_at.eq.')
    expect(orValue).toContain(',id.lt.')
  })

  it('converts field names inside and() top-level value to snake_case', () => {
    const base = new URL('https://localhost:44321/rest/v1/job_details')
    const smart = createSmartURL(base)

    const t = '2025-12-10T09:26:01.881787+00:00'
    const i = '00000000-0000-0000-0000-000000000000'

    smart.searchParams.set('and', `createdAt.eq.${t},id.lt.${i}`)

    const andValue = smart.searchParams.get('and') || ''
    expect(andValue).toContain('created_at.eq.')
    expect(andValue).toContain(',id.lt.')
  })

  it('converts field names inside not() value to snake_case', () => {
    const base = new URL('https://localhost:44321/rest/v1/job_details')
    const smart = createSmartURL(base)

    const t = '2025-12-10T09:26:01.881787+00:00'

    smart.searchParams.set('not', `createdAt.eq.${t}`)

    const notValue = smart.searchParams.get('not') || ''
    expect(notValue).toContain('created_at.eq.')
  })
})
