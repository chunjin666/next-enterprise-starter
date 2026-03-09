export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function isLocalhost(): boolean {
  return isBrowser() && /localhost|127\.0\.0\.1/.test(window.location.hostname)
}