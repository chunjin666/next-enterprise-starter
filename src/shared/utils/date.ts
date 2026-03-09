export function formatDate(date: string | Date): string {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatYearMonthDot(value: string): string {
  if (!value) return ''

  const trimmed = value.trim()
  if (!trimmed) return ''

  const yearMonthMatch = trimmed.match(/^(\d{4})[-/\.](\d{1,2})/)
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch
    return `${year}.${month.padStart(2, '0')}`
  }

  const yearOnlyMatch = trimmed.match(/^(\d{4})$/)
  if (yearOnlyMatch) {
    return yearOnlyMatch[1]
  }

  const yearPrefixMatch = trimmed.match(/^(\d{4})/)
  if (yearPrefixMatch) {
    return yearPrefixMatch[1]
  }

  return trimmed
}

export function formatDateRange(startDate: string, endDate?: string | null): string {
  if (!startDate) return ''
  
  const start = new Date(startDate).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  })
  
  if (!endDate || endDate === '至今') {
    return `${start} - 至今`
  }
  
  const end = new Date(endDate).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long' 
  })
  
  return `${start} - ${end}`
}
