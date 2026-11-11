export type ClickIds = {
  gclid?: string
  gbraid?: string
  wbraid?: string
}

export type PurchaseAttribution = ClickIds & {
  gaClientId?: string
  gaSessionId?: string
  statisticsConsent: boolean
  marketingConsent: boolean
  capturedAt?: string
}

export type TrackingChannelStatus = 'pending' | 'sending' | 'sent' | 'skipped' | 'failed'

export type TrackingChannelState = {
  status: TrackingChannelStatus
  sentAt?: string
  reason?: string
  /** Data Manager `requestId` after a successful ingest. */
  requestId?: string
}

export type PurchaseTrackingRecord = {
  attribution?: PurchaseAttribution
  transactionId?: string
  ga4?: TrackingChannelState
  ads?: TrackingChannelState
}

export const CLICK_ID_PATTERN = /^[A-Za-z0-9._~-]{1,200}$/

export const sanitizeClickId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return CLICK_ID_PATTERN.test(trimmed) ? trimmed : undefined
}

export const sanitizePurchaseAttribution = (value: unknown): PurchaseAttribution | null => {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const attribution: PurchaseAttribution = {
    statisticsConsent: raw.statisticsConsent === true,
    marketingConsent: raw.marketingConsent === true,
  }
  const gclid = sanitizeClickId(raw.gclid)
  const gbraid = sanitizeClickId(raw.gbraid)
  const wbraid = sanitizeClickId(raw.wbraid)
  const gaClientId = sanitizeClickId(raw.gaClientId)
  const gaSessionId = sanitizeClickId(raw.gaSessionId)
  if (gclid) attribution.gclid = gclid
  if (gbraid) attribution.gbraid = gbraid
  if (wbraid) attribution.wbraid = wbraid
  if (gaClientId) attribution.gaClientId = gaClientId
  if (gaSessionId) attribution.gaSessionId = gaSessionId
  if (typeof raw.capturedAt === 'string' && raw.capturedAt.length <= 40) {
    attribution.capturedAt = raw.capturedAt
  }
  return attribution
}
