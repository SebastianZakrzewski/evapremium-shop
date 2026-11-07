export type SandboxTrackingRecord = {
  channel: 'inspector'
  event: 'purchase' | 'conversion'
  payload: Record<string, unknown>
}

declare global {
  interface Window {
    __sandboxTracking?: SandboxTrackingRecord[]
  }
}

export const resetSandboxTrackingForTests = (): void => {
  if (typeof window === 'undefined') return
  window.__sandboxTracking = []
}

export const readSandboxTracking = (): SandboxTrackingRecord[] => {
  if (typeof window === 'undefined') return []
  return window.__sandboxTracking ?? []
}

/** Local-only sink. Nothing here is sent to GA4, GTM, or Google Ads. */
export const recordSandboxTracking = (record: SandboxTrackingRecord): void => {
  if (typeof window === 'undefined') return
  window.__sandboxTracking = window.__sandboxTracking || []
  window.__sandboxTracking.push(record)
}
