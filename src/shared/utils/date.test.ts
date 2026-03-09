import { describe, expect, it } from 'vitest'

import { formatYearMonthDot } from './date'

describe('formatYearMonthDot', () => {
  it('returns empty string for empty inputs', () => {
    expect(formatYearMonthDot('')).toBe('')
    expect(formatYearMonthDot('   ')).toBe('')
  })

  it('formats YYYY-MM as YYYY.MM', () => {
    expect(formatYearMonthDot('2017-09')).toBe('2017.09')
    expect(formatYearMonthDot('2017-9')).toBe('2017.09')
  })

  it('keeps YYYY as YYYY', () => {
    expect(formatYearMonthDot('2017')).toBe('2017')
  })

  it('handles YYYY-MM-DD and other extended strings', () => {
    expect(formatYearMonthDot('2017-09-01')).toBe('2017.09')
    expect(formatYearMonthDot('2017/9')).toBe('2017.09')
    expect(formatYearMonthDot('2017.9')).toBe('2017.09')
  })

  it('falls back safely for non-date strings', () => {
    expect(formatYearMonthDot('至今')).toBe('至今')
    expect(formatYearMonthDot('present')).toBe('present')
  })
})

