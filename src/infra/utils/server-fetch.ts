export type CacheInit =
  | ({ cache: 'no-store' | 'force-cache' } & Omit<RequestInit, 'cache'>)
  | ({ next: { revalidate: number; tags?: string[] } } & RequestInit)

export async function serverFetch<T = unknown>(input: RequestInfo | URL, init: CacheInit): Promise<T> {
  const res = await fetch(
    input,
    'next' in init
      ? { ...init, next: init.next }
      : { ...init, cache: init.cache }
  )
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}