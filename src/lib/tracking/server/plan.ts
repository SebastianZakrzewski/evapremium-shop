import type { Order, OrderItem } from '@/lib/types/order-new'
import type { PurchaseAttribution, PurchaseTrackingRecord, TrackingChannelState } from '../attribution/types'
import { adsUploadEnabled, serverTrackingBlockReason, type ServerTrackingEnv } from './gate'

export type Ga4ItemPayload = {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

export type Ga4PurchaseBody = {
  client_id: string
  events: Array<{
    name: 'purchase'
    params: {
      transaction_id: string
      currency: 'PLN'
      value: number
      items: Ga4ItemPayload[]
      session_id?: string
      debug_mode?: 1
    }
  }>
}

export type AdsClickConversion = {
  conversionAction: string
  conversionDateTime: string
  conversionValue: number
  currencyCode: 'PLN'
  orderId: string
  /** v23 click uploads use adUserData. adPersonalization is not accepted on this service. */
  consent: { adUserData: 'GRANTED' }
  gclid?: string
  gbraid?: string
  wbraid?: string
}

export type PurchaseSendPlan = {
  blocked?: string
  transactionId: string
  ga4: TrackingChannelState & { body?: Ga4PurchaseBody }
  ads: TrackingChannelState & { conversion?: AdsClickConversion }
}

const toItem = (item: OrderItem): Ga4ItemPayload => ({
  item_id: item.productId || item.id,
  item_name: item.productName,
  price: Number(item.unitPrice || 0),
  quantity: Number(item.quantity || 1),
})

export const clientTransactionId = (
  order: Pick<Order, 'id' | 'p24OrderId'>,
  providerPaymentId?: string | null
): string => order.p24OrderId || providerPaymentId || order.id

const channel = (
  status: TrackingChannelState['status'],
  reason?: string
): TrackingChannelState => ({
  status,
  ...(reason ? { reason } : {}),
})

const alreadySent = (state?: TrackingChannelState): boolean =>
  state?.status === 'sent' || state?.status === 'sending'

export const preferredClickId = (
  attribution?: PurchaseAttribution
): 'gclid' | 'gbraid' | 'wbraid' | null => {
  if (!attribution) return null
  if (attribution.gclid) return 'gclid'
  if (attribution.gbraid) return 'gbraid'
  if (attribution.wbraid) return 'wbraid'
  return null
}

export const adsConversionResource = (env: ServerTrackingEnv): string | null => {
  const action = env.googleAdsConversionAction?.trim()
  const customerId = env.googleAdsCustomerId?.replace(/-/g, '').trim()
  if (!action || !customerId) return null
  if (action.startsWith('customers/')) return action
  return `customers/${customerId}/conversionActions/${action}`
}

export const adsCredentialsReady = (env: ServerTrackingEnv): boolean =>
  Boolean(
    env.googleAdsClientId &&
      env.googleAdsClientSecret &&
      env.googleAdsRefreshToken &&
      env.googleAdsCustomerId &&
      adsConversionResource(env)
  )

/**
 * Ads wants `yyyy-mm-dd hh:mm:ss+hh:mm` in the account timezone.
 * The shop account is Poland, so the stamp is Europe/Warsaw.
 */
export const formatAdsConversionDateTime = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  }).formatToParts(date)

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const offset = read('timeZoneName').replace('GMT', '') || '+00:00'

  return `${read('year')}-${read('month')}-${read('day')} ${read('hour')}:${read('minute')}:${read('second')}${offset}`
}

export const planServerPurchase = (input: {
  order: Order
  tracking: PurchaseTrackingRecord | null
  providerPaymentId?: string | null
  paidAt: Date
  env: ServerTrackingEnv
}): PurchaseSendPlan => {
  const transactionId = clientTransactionId(input.order, input.providerPaymentId)
  const blocked = serverTrackingBlockReason(input.env)
  if (blocked) {
    return {
      blocked,
      transactionId,
      ga4: channel('skipped', blocked),
      ads: channel('skipped', blocked),
    }
  }

  const attribution = input.tracking?.attribution
  const items = (input.order.items || []).map(toItem)
  let ga4: PurchaseSendPlan['ga4'] = channel('skipped', 'not_evaluated')
  let ads: PurchaseSendPlan['ads'] = channel('skipped', 'not_evaluated')

  if (alreadySent(input.tracking?.ga4)) {
    ga4 = channel('sent', 'already_sent')
  } else if (!input.env.ga4MeasurementId || !input.env.ga4ApiSecret) {
    ga4 = channel('skipped', 'missing_ga4_config')
  } else if (attribution?.statisticsConsent !== true) {
    ga4 = channel('skipped', 'statistics_consent_denied')
  } else if (!attribution.gaClientId) {
    ga4 = channel('skipped', 'missing_client_id')
  } else if (items.length === 0) {
    ga4 = channel('skipped', 'missing_items')
  } else {
    const params: Ga4PurchaseBody['events'][number]['params'] = {
      transaction_id: transactionId,
      currency: 'PLN',
      value: Number(input.order.total || 0),
      items,
    }
    if (attribution.gaSessionId) params.session_id = attribution.gaSessionId
    if (input.env.ga4DebugMode === 'true') params.debug_mode = 1
    ga4 = {
      status: 'pending',
      body: { client_id: attribution.gaClientId, events: [{ name: 'purchase', params }] },
    }
  }

  const clickField = preferredClickId(attribution)
  if (alreadySent(input.tracking?.ads)) {
    ads = channel('sent', 'already_sent')
  } else if (!adsUploadEnabled(input.env)) {
    ads = channel('skipped', 'ads_upload_disabled')
  } else if (attribution?.marketingConsent !== true) {
    ads = channel('skipped', 'marketing_consent_denied')
  } else if (!clickField) {
    ads = channel('skipped', 'missing_click_id')
  } else if (!adsCredentialsReady(input.env)) {
    ads = channel('skipped', 'missing_ads_config')
  } else {
    const conversion: AdsClickConversion = {
      conversionAction: adsConversionResource(input.env) as string,
      conversionDateTime: formatAdsConversionDateTime(input.paidAt),
      conversionValue: Number(input.order.total || 0),
      currencyCode: 'PLN',
      orderId: input.order.orderNumber,
      consent: { adUserData: 'GRANTED' },
    }
    if (clickField === 'gclid') conversion.gclid = attribution?.gclid
    if (clickField === 'gbraid') conversion.gbraid = attribution?.gbraid
    if (clickField === 'wbraid') conversion.wbraid = attribution?.wbraid
    ads = { status: 'pending', conversion }
  }

  return { transactionId, ga4, ads }
}
