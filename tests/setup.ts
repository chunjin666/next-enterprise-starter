import { vi } from 'vitest'

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// Mock Performance APIs for performance testing
const performanceMock = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn().mockReturnValue([]),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now()),
  getEntriesByType: vi.fn().mockReturnValue([]),
  observe: vi.fn(),
}

const performanceObserverMock = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([]),
}))

vi.stubGlobal('performance', performanceMock)
vi.stubGlobal('PerformanceObserver', performanceObserverMock)

// Mock Memory API for memory leak testing
const memoryMock = {
  usedJSHeapSize: 1000000,
  totalJSHeapSize: 2000000,
  jsHeapSizeLimit: 4000000,
}

Object.defineProperty(performanceMock, 'memory', {
  value: memoryMock,
  writable: true,
})
