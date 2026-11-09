const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS = 5

const hits = new Map<string, number[]>()

export const resetContactRateLimit = (): void => {
  hits.clear()
}

export const isContactRateLimited = (key: string, now = Date.now()): boolean => {
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS)

  if (hits.size > 1000) {
    for (const [storedKey, stamps] of hits) {
      if (stamps.every((stamp) => now - stamp >= WINDOW_MS)) {
        hits.delete(storedKey)
      }
    }
  }

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent)
    return true
  }

  recent.push(now)
  hits.set(key, recent)
  return false
}
