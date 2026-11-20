import type { PurchaseTrackingRecord } from '../attribution/types'
import { buildDataManagerIngestBody, type DataManagerIngestBody } from './dataManagerAds'
import type { ServerTrackingEnv } from './gate'
import { buildAdsPurchaseEvent, preferredClickId, type DataManagerAdsEvent } from './plan'

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
  clickIdField: 'gclid' | 'gbraid' | 'wbraid'
  clickIdPrefix: string
}

const maskClickId = (value: string): string =>
  value.length <= 8 ? `${value.slice(0, 2)}…` : `${value.slice(0, 6)}…`

const redactAdIdentifiers = (
  identifiers: DataManagerAdsEvent['adIdentifiers']
): DataManagerAdsEvent['adIdentifiers'] => {
  const redacted: DataManagerAdsEvent['adIdentifiers'] = {}
  if (identifiers.gclid) redacted.gclid = maskClickId(identifiers.gclid)
  if (identifiers.gbraid) redacted.gbraid = maskClickId(identifiers.gbraid)
  if (identifiers.wbraid) redacted.wbraid = maskClickId(identifiers.wbraid)
  return redacted
}

/**
 * Paid orders from the last 90 days that already have marketing consent, a
 * click id the uploader can send, and an Ads upload that has not succeeded.
 * Skipped (no consent) and sent orders are left alone. `transactionId` on the
 * event is the shop order number, which is the Google dedupe key.
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
    const clickIdField = preferredClickId(tracking.attribution)
    if (!clickIdField) continue
    const clickId = tracking.attribution[clickIdField]
    if (!clickId) continue
    selected.push({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      adsStatus,
      clickIdField,
      clickIdPrefix: maskClickId(clickId),
    })
  }
  return selected
}

/**
 * Exact Data Manager body for one backfill order, with click ids shortened.
 * `paidAt` must be the absolute payment instant (`payments.paid_at`).
 */
export const previewAdsBackfillPayload = (
  order: AdsBackfillOrder,
  paidAt: Date,
  env: ServerTrackingEnv
): DataManagerIngestBody | null => {
  const event = buildAdsPurchaseEvent({
    orderNumber: order.orderNumber,
    total: order.total,
    paidAt,
    attribution: order.purchaseTracking?.attribution,
  })
  if (!event) return null
  const body = buildDataManagerIngestBody(env, event)
  return {
    ...body,
    events: body.events.map((item) => ({
      ...item,
      adIdentifiers: redactAdIdentifiers(item.adIdentifiers),
    })),
  }
}
