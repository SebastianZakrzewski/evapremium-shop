import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@/lib/types/order-new'
import type { PurchaseTrackingRecord } from '../attribution/types'
import {
  adsFailureReason,
  buildDataManagerIngestBody,
  formatDataManagerError,
  formatOAuthError,
  ingestAdsClickEvent,
} from '../server/dataManagerAds'
import type { ServerTrackingEnv } from '../server/gate'
import type { DataManagerAdsEvent } from '../server/plan'
import { trackPaidPaynowPurchase } from '../server/sendPurchase'

const env = (): ServerTrackingEnv => ({
  googleAdsClientId: 'client',
  googleAdsClientSecret: 'secret',
  googleAdsRefreshToken: 'refresh',
  googleAdsCustomerId: '614-270-0676',
  googleAdsConversionAction: '7896361865',
  googleAdsDeveloperToken: 'unused',
})

const event = (): DataManagerAdsEvent => ({
  transactionId: 'ORD-2026-000536',
  eventTimestamp: '2026-11-10T13:24:44+01:00',
  eventSource: 'WEB',
  conversionValue: 1200,
  currency: 'PLN',
  consent: { adUserData: 'CONSENT_GRANTED' },
  adIdentifiers: { gclid: 'EAIaIQobChMI-example' },
})

describe('Data Manager Ads client', () => {
  it('builds an ingest body for the operating account and numeric conversion action', () => {
    const body = buildDataManagerIngestBody(env(), event())
    expect(body).toEqual({
      destinations: [
        {
          operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '6142700676' },
          productDestinationId: '7896361865',
        },
      ],
      events: [event()],
      consent: { adUserData: 'CONSENT_GRANTED' },
    })
    expect(JSON.stringify(body)).not.toContain('developer-token')
    expect(JSON.stringify(body)).not.toContain('userData')
  })

  it('formats OAuth and Data Manager failures into a stored reason', () => {
    expect(formatOAuthError(400, { error: 'invalid_grant', error_description: 'Token has been expired or revoked.' })).toBe(
      'Google OAuth HTTP 400: invalid_grant: Token has been expired or revoked.'
    )
    expect(
      formatDataManagerError(403, {
        error: {
          status: 'PERMISSION_DENIED',
          message: 'Request had insufficient authentication scopes.',
          details: [{ reason: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' }],
        },
      })
    ).toContain('ACCESS_TOKEN_SCOPE_INSUFFICIENT')

    const timeout = new Error('The operation was aborted due to timeout')
    timeout.name = 'TimeoutError'
    expect(adsFailureReason(timeout)).toBe('Google Ads request timed out')
  })

  it('returns the request id and does not treat field warnings as a failure', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      return new Response(
        JSON.stringify({
          requestId: 'req-1',
          fieldWarnings: [{ field: 'events[0].currency', reason: 'UNKNOWN', description: 'Currency was normalized.' }],
        }),
        { status: 200 }
      )
    })
    const result = await ingestAdsClickEvent(env(), event(), fetchImpl as unknown as typeof fetch)
    expect(result.requestId).toBe('req-1')
    expect(result.warning).toContain('Currency was normalized.')
    const init = fetchImpl.mock.calls[1]?.[1] as RequestInit
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect((init.headers as Record<string, string>)['developer-token']).toBeUndefined()
  })

  it('fails closed when the success body has no request id', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })
    await expect(ingestAdsClickEvent(env(), event(), fetchImpl as unknown as typeof fetch)).rejects.toThrow(
      'Data Manager response missing requestId'
    )
  })
})

const paidOrder = (tracking: PurchaseTrackingRecord): Order =>
  ({
    id: 'order-1',
    orderNumber: 'ORD-2026-000536',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'paynow',
    customer: { name: 'Synthetic', email: 'synthetic@example.com', phone: '000' },
    shippingAddress: { street: 'Synthetic 1', city: 'Sandbox', postalCode: '00-000', country: 'PL' },
    subtotal: 1200,
    shippingCost: 0,
    tax: 0,
    discount: 0,
    total: 1200,
    items: [],
    createdAt: new Date('2026-11-10T12:22:55.000Z'),
    updatedAt: new Date('2026-11-10T12:24:44.000Z'),
    purchaseTracking: tracking,
  }) as Order

describe('Ads backfill send', () => {
  it('re-sends a failed Ads upload and does not call GA4', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('google-analytics.com')) throw new Error('ga4 should not be called')
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      return new Response(JSON.stringify({ requestId: 'req-backfill' }), { status: 200 })
    })
    const tracking: PurchaseTrackingRecord = {
      attribution: {
        gclid: 'EAIaIQobChMI-example',
        gaClientId: '123.456',
        statisticsConsent: true,
        marketingConsent: true,
      },
      ga4: { status: 'sent', sentAt: '2026-11-10T12:24:44.000Z' },
      ads: { status: 'failed', reason: 'old upload rejected' },
    }
    const result = await trackPaidPaynowPurchase(
      {
        orderId: 'order-1',
        paidAt: '2026-11-10T12:24:44.000Z',
        paymentEnvironment: 'production',
        channels: { ga4: false, ads: true },
      },
      {
        env: {
          ...env(),
          vercelEnv: 'production',
          serverTrackingEnabled: 'true',
          adsServerUploadEnabled: 'true',
          paynowEnvironment: 'production',
          ga4MeasurementId: 'G-SGHPWGL4P4',
          ga4ApiSecret: 'test-secret',
        },
        fetchImpl: fetchImpl as unknown as typeof fetch,
        loadOrder: async () => paidOrder(tracking),
        saveTracking: async () => undefined,
      }
    )
    expect(result?.ga4?.status).toBe('sent')
    expect(result?.ads?.status).toBe('sent')
    expect(result?.ads?.requestId).toBe('req-backfill')
    const body = JSON.parse(String((fetchImpl.mock.calls.find((call) => String(call[0]).includes('datamanager'))?.[1] as RequestInit).body))
    expect(body.events[0].transactionId).toBe('ORD-2026-000536')
    expect(body.events[0].adIdentifiers.gclid).toBe('EAIaIQobChMI-example')
  })
})
