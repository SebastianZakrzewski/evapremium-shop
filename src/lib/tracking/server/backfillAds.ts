import type { PurchaseTrackingRecord } from '../attribution/types'

export const ADS_BACKFILL_LOOKBACK_DAYS = 90
const LOOKBACK_MS = ADS_BACKFILL_LOOKBACK_DAYS * 24 * 60 * 60 * 1000

export type AdsBackfillOrder = {
  id: string
  orderNumber: string
  paymentStatus: string
  total: number
  createdAt: Date
  purchaseTracking: PurchaseTrackingRecord | null
}

export type AdsBackfillCandidate = {
  orderId: string
  orderNumber: string
  total: number
  adsStatus: 'failed' | 'pending'
  gclidPrefix: string
}

const maskClickId = (value: string): string =>
  value.length <= 8 ? `${value.slice(0, 2)}…` : `${value.slice(0, 6)}…`

/**
 * Paid orders from the last 90 days that already have marketing consent, a
 * gclid, and an Ads upload that has not succeeded. Skipped (no consent) and
 * sent orders are left alone.
 */
export const selectAdsBackfillCandidates = (
  orders: AdsBackfillOrder[],
  now: Date = new Date()
): AdsBackfillCandidate[] => {
  const cutoff = now.getTime() - LOOKBACK_MS
  const selected: AdsBackfillCandidate[] = []
  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue
    if (order.createdAt.getTime() < cutoff) continue
    const tracking = order.purchaseTracking
    const adsStatus = tracking?.ads?.status
    if (adsStatus !== 'failed' && adsStatus !== 'pending') continue
    if (tracking?.attribution?.marketingConsent !== true) continue
    const gclid = tracking.attribution.gclid
    if (!gclid) continue
    selected.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      adsStatus,
      gclidPrefix: maskClickId(gclid),
    })
  }
  return selected
}
