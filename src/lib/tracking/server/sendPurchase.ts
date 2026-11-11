import type { Order } from '@/lib/types/order-new'
import type { PurchaseTrackingRecord, TrackingChannelState } from '../attribution/types'
import { adsFailureReason, GOOGLE_REQUEST_TIMEOUT_MS, ingestAdsClickEvent } from './dataManagerAds'
import type { ServerTrackingEnv } from './gate'
import { planServerPurchase, type Ga4PurchaseBody } from './plan'

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect'

export type TrackPaidPaynowInput = {
  orderId: string
  providerPaymentId?: string | null
  paymentEnvironment?: string | null
  paidAt?: string | null
  /** Omit a channel to leave its stored state unchanged. Backfill sends Ads only. */
  channels?: { ga4?: boolean; ads?: boolean }
}

export type TrackPaidDeps = {
  env: ServerTrackingEnv
  fetchImpl: typeof fetch
  loadOrder: (orderId: string) => Promise<Order | null>
  saveTracking: (orderId: string, tracking: PurchaseTrackingRecord) => Promise<void>
}

const withStatus = (
  state: TrackingChannelState,
  status: TrackingChannelState['status'],
  reason?: string
): TrackingChannelState => ({
  status,
  ...(state.sentAt ? { sentAt: state.sentAt } : {}),
  ...(reason ? { reason } : {}),
  ...(status === 'sent' ? { sentAt: new Date().toISOString(), reason: undefined } : {}),
})

const postGa4 = async (
  env: ServerTrackingEnv,
  body: Ga4PurchaseBody,
  fetchImpl: typeof fetch
): Promise<void> => {
  const measurementId = env.ga4MeasurementId as string
  const apiSecret = env.ga4ApiSecret as string
  const url = `${GA4_COLLECT_URL}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`GA4 Measurement Protocol HTTP ${response.status}`)
  }
}

const channelForSave = (
  stored: TrackingChannelState | undefined,
  planned: TrackingChannelState
): TrackingChannelState => {
  if (stored && (stored.status === 'sent' || stored.status === 'sending')) return stored
  return {
    status: planned.status,
    ...(planned.reason ? { reason: planned.reason } : {}),
    ...(stored?.sentAt ? { sentAt: stored.sentAt } : {}),
  }
}

const markSent = (
  extra?: { requestId?: string; warning?: string }
): TrackingChannelState => ({
  status: 'sent',
  sentAt: new Date().toISOString(),
  ...(extra?.requestId ? { requestId: extra.requestId } : {}),
  ...(extra?.warning ? { reason: extra.warning } : {}),
})

export const trackPaidPaynowPurchase = async (
  input: TrackPaidPaynowInput,
  deps: TrackPaidDeps
): Promise<PurchaseTrackingRecord | null> => {
  const order = await deps.loadOrder(input.orderId)
  if (!order || order.paymentStatus !== 'paid') return null

  const stored = (order.purchaseTracking ?? null) as PurchaseTrackingRecord | null
  const paidAt = input.paidAt ? new Date(input.paidAt) : new Date()
  const plan = planServerPurchase({
    order,
    tracking: stored,
    providerPaymentId: input.providerPaymentId,
    paidAt: Number.isNaN(paidAt.getTime()) ? new Date() : paidAt,
    env: { ...deps.env, paymentEnvironment: input.paymentEnvironment ?? undefined },
  })

  if (plan.blocked) return null

  const sendGa4 = input.channels?.ga4 !== false
  const sendAds = input.channels?.ads !== false

  const next: PurchaseTrackingRecord = {
    attribution: stored?.attribution,
    transactionId: plan.transactionId,
    ga4: sendGa4 ? channelForSave(stored?.ga4, plan.ga4) : stored?.ga4,
    ads: sendAds ? channelForSave(stored?.ads, plan.ads) : stored?.ads,
  }

  if (sendGa4 && plan.ga4.status === 'pending' && plan.ga4.body) {
    next.ga4 = withStatus(next.ga4 || { status: 'pending' }, 'sending')
    await deps.saveTracking(order.id, next)
    try {
      await postGa4(deps.env, plan.ga4.body, deps.fetchImpl)
      next.ga4 = withStatus(next.ga4, 'sent')
    } catch (error) {
      next.ga4 = withStatus(
        next.ga4,
        'failed',
        error instanceof Error ? error.message : 'ga4_failed'
      )
    }
  }

  if (sendAds && plan.ads.status === 'pending' && plan.ads.event) {
    next.ads = withStatus(next.ads || { status: 'pending' }, 'sending')
    await deps.saveTracking(order.id, next)
    try {
      const result = await ingestAdsClickEvent(deps.env, plan.ads.event, deps.fetchImpl)
      next.ads = markSent({ requestId: result.requestId, warning: result.warning })
    } catch (error) {
      next.ads = withStatus(next.ads, 'failed', adsFailureReason(error))
    }
  }

  await deps.saveTracking(order.id, next)
  return next
}

