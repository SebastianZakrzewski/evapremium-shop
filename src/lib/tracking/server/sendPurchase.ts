import type { Order } from '@/lib/types/order-new'
import type { PurchaseTrackingRecord, TrackingChannelState } from '../attribution/types'
import type { ServerTrackingEnv } from './gate'
import { planServerPurchase, type AdsClickConversion, type Ga4PurchaseBody } from './plan'

const GA4_COLLECT_URL = 'https://www.google-analytics.com/mp/collect'
const GOOGLE_ADS_VERSION = 'v18'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export type TrackPaidPaynowInput = {
  orderId: string
  providerPaymentId?: string | null
  paymentEnvironment?: string | null
  paidAt?: string | null
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
  })
  if (!response.ok) {
    throw new Error(`GA4 Measurement Protocol HTTP ${response.status}`)
  }
}

const accessToken = async (env: ServerTrackingEnv, fetchImpl: typeof fetch): Promise<string> => {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.googleAdsClientId as string,
    client_secret: env.googleAdsClientSecret as string,
    refresh_token: env.googleAdsRefreshToken as string,
  })
  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    throw new Error(`Google OAuth HTTP ${response.status}`)
  }
  const payload = (await response.json()) as { access_token?: string }
  if (!payload.access_token) {
    throw new Error('Google OAuth response missing access_token')
  }
  return payload.access_token
}

const postAds = async (
  env: ServerTrackingEnv,
  conversion: AdsClickConversion,
  fetchImpl: typeof fetch
): Promise<void> => {
  const token = await accessToken(env, fetchImpl)
  const customerId = (env.googleAdsCustomerId as string).replace(/-/g, '')
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'developer-token': env.googleAdsDeveloperToken as string,
    'Content-Type': 'application/json',
  }
  if (env.googleAdsLoginCustomerId) {
    headers['login-customer-id'] = env.googleAdsLoginCustomerId.replace(/-/g, '')
  }
  const response = await fetchImpl(
    `https://googleads.googleapis.com/${GOOGLE_ADS_VERSION}/customers/${customerId}:uploadClickConversions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        conversions: [conversion],
        partialFailure: true,
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`Google Ads upload HTTP ${response.status}`)
  }
  const text = await response.text()
  if (!text) return
  const payload = JSON.parse(text) as { partialFailureError?: { message?: string } }
  if (payload.partialFailureError) {
    throw new Error(payload.partialFailureError.message || 'Google Ads partial failure')
  }
}

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

  const next: PurchaseTrackingRecord = {
    attribution: stored?.attribution,
    transactionId: plan.transactionId,
    ga4: { status: plan.ga4.status, reason: plan.ga4.reason, sentAt: stored?.ga4?.sentAt },
    ads: { status: plan.ads.status, reason: plan.ads.reason, sentAt: stored?.ads?.sentAt },
  }

  if (plan.ga4.status === 'pending' && plan.ga4.body) {
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

  if (plan.ads.status === 'pending' && plan.ads.conversion) {
    next.ads = withStatus(next.ads || { status: 'pending' }, 'sending')
    await deps.saveTracking(order.id, next)
    try {
      await postAds(deps.env, plan.ads.conversion, deps.fetchImpl)
      next.ads = withStatus(next.ads, 'sent')
    } catch (error) {
      next.ads = withStatus(
        next.ads,
        'failed',
        error instanceof Error ? error.message : 'ads_failed'
      )
    }
  }

  await deps.saveTracking(order.id, next)
  return next
}

