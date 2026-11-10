import { describe, expect, it, vi } from 'vitest'
import type { Order } from '@/lib/types/order-new'
import type { PurchaseTrackingRecord } from '../attribution/types'
import { collectPurchaseAttribution, parseGaClientId, parseGaSessionId, parseGclAw } from '../attribution/collect'
import { adsCredentialsReady, planServerPurchase } from '../server/plan'
import { trackPaidPaynowPurchase } from '../server/sendPurchase'
import type { ServerTrackingEnv } from '../server/gate'

const enabledEnv = (): ServerTrackingEnv => ({
  vercelEnv: 'production',
  paynowEnvironment: 'production',
  serverTrackingEnabled: 'true',
  adsServerUploadEnabled: 'true',
  ga4MeasurementId: 'G-SGHPWGL4P4',
  ga4ApiSecret: 'test-secret',
  googleAdsDeveloperToken: 'dev-token',
  googleAdsClientId: 'client',
  googleAdsClientSecret: 'secret',
  googleAdsRefreshToken: 'refresh',
  googleAdsCustomerId: '6142700676',
  googleAdsConversionAction: '7861775516',
})

const paidOrder = (tracking: PurchaseTrackingRecord | null = null): Order => ({
  id: 'order-1',
  orderNumber: 'ORD-2026-000528',
  status: 'confirmed',
  paymentStatus: 'paid',
  paymentMethod: 'paynow',
  customer: { name: 'Synthetic', email: 'synthetic@example.com', phone: '000' },
  shippingAddress: { street: 'Synthetic 1', city: 'Sandbox', postalCode: '00-000', country: 'PL' },
  subtotal: 847,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 847,
  items: [
    {
      id: 'item-1',
      quantity: 1,
      unitPrice: 847,
      subtotal: 847,
      productType: 'mat',
      productId: 'mat-1',
      productName: 'Dywaniki EVA',
      orderId: 'order-1',
      createdAt: new Date('2026-11-08T10:00:00.000Z'),
      updatedAt: new Date('2026-11-08T10:00:00.000Z'),
    },
  ],
  createdAt: new Date('2026-11-08T10:00:00.000Z'),
  updatedAt: new Date('2026-11-08T11:00:00.000Z'),
  purchaseTracking: tracking,
})

const attribution = {
  gclid: 'click-123',
  gaClientId: '123.456',
  gaSessionId: '1699000000',
  statisticsConsent: true,
  marketingConsent: true,
}

describe('attribution capture', () => {
  it('reads GA client id, session id, gclid cookie, and consent', () => {
    expect(parseGaClientId('GA1.1.123.456')).toBe('123.456')
    expect(parseGaSessionId('GS1.1.1699000000.1.1.0.0.0.0')).toBe('1699000000')
    expect(parseGclAw('GCL.1700000000.click-123')).toBe('click-123')

    const collected = collectPurchaseAttribution({
      cookieString:
        "_ga=GA1.1.123.456; _ga_SGHPWGL4P4=GS1.1.1699000000.1; _gcl_aw=GCL.1.click-123; CookieConsent={stamp:'x',necessary:true,preferences:false,statistics:true,marketing:false,method:'explicit'}",
    })

    expect(collected.gaClientId).toBe('123.456')
    expect(collected.gaSessionId).toBe('1699000000')
    expect(collected.gclid).toBe('click-123')
    expect(collected.statisticsConsent).toBe(true)
    expect(collected.marketingConsent).toBe(false)
  })
})

describe('server purchase plan', () => {
  const paidAt = new Date('2026-11-08T12:00:00.000Z')

  it('builds a GA4 purchase with the Paynow payment id and an Ads click conversion', () => {
    const plan = planServerPurchase({
      order: paidOrder({ attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } }),
      tracking: { attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: enabledEnv(),
    })

    expect(plan.transactionId).toBe('PAY-528')
    expect(plan.ga4.body).toMatchObject({
      client_id: '123.456',
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: 'PAY-528',
            currency: 'PLN',
            value: 847,
            session_id: '1699000000',
            items: [{ item_id: 'mat-1', item_name: 'Dywaniki EVA', price: 847, quantity: 1 }],
          },
        },
      ],
    })
    expect(plan.ads.conversion).toMatchObject({
      conversionAction: 'customers/6142700676/conversionActions/7861775516',
      conversionValue: 847,
      currencyCode: 'PLN',
      orderId: 'ORD-2026-000528',
      gclid: 'click-123',
      consent: { adUserData: 'GRANTED' },
    })
    expect(plan.ads.conversion?.conversionDateTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/)
    expect(plan.ads.conversion).not.toHaveProperty('adPersonalization')
    expect(plan.ads.conversion?.consent).not.toHaveProperty('adPersonalization')
  })

  it('treats Ads credentials as ready without a developer token or login customer id', () => {
    const withoutToken = { ...enabledEnv(), googleAdsDeveloperToken: undefined }
    expect(adsCredentialsReady(withoutToken)).toBe(true)
    expect(adsCredentialsReady({ ...withoutToken, googleAdsDeveloperToken: '   ' })).toBe(true)
    expect(adsCredentialsReady({ ...enabledEnv(), googleAdsClientId: undefined })).toBe(false)
    expect(adsCredentialsReady({ ...enabledEnv(), googleAdsRefreshToken: '' })).toBe(false)
    expect(adsCredentialsReady({ ...enabledEnv(), googleAdsConversionAction: undefined })).toBe(false)

    const plan = planServerPurchase({
      order: paidOrder({ attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } }),
      tracking: { attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: withoutToken,
    })
    expect(plan.ads.status).toBe('pending')
    expect(plan.ads.conversion?.consent).toEqual({ adUserData: 'GRANTED' })

    const missing = planServerPurchase({
      order: paidOrder({ attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } }),
      tracking: { attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: { ...enabledEnv(), googleAdsCustomerId: undefined },
    })
    expect(missing.ads.reason).toBe('missing_ads_config')
    expect(missing.ga4.status).toBe('pending')
  })

  it('skips GA4 without statistics consent or client id, and Ads without a click id or marketing consent', () => {
    const noConsent = planServerPurchase({
      order: paidOrder({
        attribution: { ...attribution, statisticsConsent: false, marketingConsent: false },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      }),
      tracking: {
        attribution: { ...attribution, statisticsConsent: false, marketingConsent: false },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: enabledEnv(),
    })
    expect(noConsent.ga4.reason).toBe('statistics_consent_denied')
    expect(noConsent.ads.reason).toBe('marketing_consent_denied')

    const noClick = planServerPurchase({
      order: paidOrder({
        attribution: { statisticsConsent: true, marketingConsent: true, gaClientId: '123.456' },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      }),
      tracking: {
        attribution: { statisticsConsent: true, marketingConsent: true, gaClientId: '123.456' },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: enabledEnv(),
    })
    expect(noClick.ga4.status).toBe('pending')
    expect(noClick.ads.reason).toBe('missing_click_id')

    const noClient = planServerPurchase({
      order: paidOrder({
        attribution: { statisticsConsent: true, marketingConsent: false },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      }),
      tracking: {
        attribution: { statisticsConsent: true, marketingConsent: false },
        ga4: { status: 'pending' },
        ads: { status: 'pending' },
      },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: enabledEnv(),
    })
    expect(noClient.ga4.reason).toBe('missing_client_id')
  })

  it('does not send from preview, sandbox isolation, Paynow sandbox, or when the flag is off', () => {
    const base = {
      order: paidOrder({ attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } }),
      tracking: { attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } },
      providerPaymentId: 'PAY-528',
      paidAt,
    }
    expect(planServerPurchase({ ...base, env: { ...enabledEnv(), vercelEnv: 'preview' } }).blocked).toBe('preview')
    expect(planServerPurchase({ ...base, env: { ...enabledEnv(), sandboxIsolation: 'enforce' } }).blocked).toBe('sandbox_isolation')
    expect(planServerPurchase({ ...base, env: { ...enabledEnv(), paynowEnvironment: 'sandbox' } }).blocked).toBe('paynow_sandbox')
    expect(planServerPurchase({ ...base, env: { ...enabledEnv(), paymentEnvironment: 'sandbox', paynowEnvironment: 'production' } }).blocked).toBe('paynow_sandbox')
    expect(planServerPurchase({ ...base, env: { ...enabledEnv(), serverTrackingEnabled: 'false' } }).blocked).toBe('disabled')
  })

  it('does not plan another send after a channel was already sent', () => {
    const plan = planServerPurchase({
      order: paidOrder({ attribution, ga4: { status: 'sent' }, ads: { status: 'sent' } }),
      tracking: { attribution, ga4: { status: 'sent' }, ads: { status: 'sent' } },
      providerPaymentId: 'PAY-528',
      paidAt,
      env: enabledEnv(),
    })
    expect(plan.ga4.status).toBe('sent')
    expect(plan.ga4.body).toBeUndefined()
    expect(plan.ads.status).toBe('sent')
    expect(plan.ads.conversion).toBeUndefined()
  })
})

describe('trackPaidPaynowPurchase', () => {
  it('sends once and records sent status so a second call does not send again', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      return new Response(null, { status: 204 })
    })
    let stored: PurchaseTrackingRecord | null = {
      attribution,
      ga4: { status: 'pending' },
      ads: { status: 'pending' },
    }
    const order = paidOrder(stored)
    const deps = {
      env: enabledEnv(),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      loadOrder: async () => ({ ...order, purchaseTracking: stored }),
      saveTracking: async (_id: string, tracking: PurchaseTrackingRecord) => {
        stored = tracking
      },
    }

    await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production', paidAt: '2026-11-08T12:00:00.000Z' },
      deps
    )
    const callsAfterFirst = fetchImpl.mock.calls.length
    expect(stored?.ga4?.status).toBe('sent')
    expect(stored?.ads?.status).toBe('sent')
    expect(stored?.transactionId).toBe('PAY-528')
    expect(callsAfterFirst).toBeGreaterThan(0)

    await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production', paidAt: '2026-11-08T12:00:00.000Z' },
      deps
    )
    expect(fetchImpl.mock.calls.length).toBe(callsAfterFirst)
  })

  it('records a failure and does not throw', async () => {
    const fetchImpl = vi.fn(async () => new Response('nope', { status: 500 }))
    let stored: PurchaseTrackingRecord | null = {
      attribution: { ...attribution, marketingConsent: false },
      ga4: { status: 'pending' },
      ads: { status: 'pending' },
    }
    const result = await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production' },
      {
        env: enabledEnv(),
        fetchImpl: fetchImpl as unknown as typeof fetch,
        loadOrder: async () => paidOrder(stored),
        saveTracking: async (_id, tracking) => {
          stored = tracking
        },
      }
    )
    expect(result?.ga4?.status).toBe('failed')
    expect(result?.ads?.reason).toBe('marketing_consent_denied')
  })

  it('does not call the network when preview isolation blocks sending', async () => {
    const fetchImpl = vi.fn()
    const result = await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production' },
      {
        env: { ...enabledEnv(), vercelEnv: 'preview' },
        fetchImpl: fetchImpl as unknown as typeof fetch,
        loadOrder: async () => paidOrder({ attribution, ga4: { status: 'pending' }, ads: { status: 'pending' } }),
        saveTracking: async () => undefined,
      }
    )
    expect(result).toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('uploads click conversions on Ads API v23 without a developer token', async () => {
    const withoutToken = { ...enabledEnv(), googleAdsDeveloperToken: '   ' }
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      if (String(url).includes('uploadClickConversions')) {
        return new Response(
          JSON.stringify({
            results: [{ conversionAction: 'customers/6142700676/conversionActions/7861775516' }],
          }),
          { status: 200 }
        )
      }
      return new Response(null, { status: 204 })
    })
    let stored: PurchaseTrackingRecord | null = {
      attribution,
      ga4: { status: 'pending' },
      ads: { status: 'pending' },
    }

    const result = await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production', paidAt: '2026-11-08T12:00:00.000Z' },
      {
        env: withoutToken,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        loadOrder: async () => paidOrder(stored),
        saveTracking: async (_id, tracking) => {
          stored = tracking
        },
      }
    )

    const adsCall = fetchImpl.mock.calls.find((call) => String(call[0]).includes('uploadClickConversions'))
    expect(adsCall?.[0]).toBe('https://googleads.googleapis.com/v23/customers/6142700676:uploadClickConversions')
    const init = adsCall?.[1] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer token')
    expect(headers['developer-token']).toBeUndefined()
    expect(headers['login-customer-id']).toBeUndefined()
    expect(JSON.parse(String(init.body))).toMatchObject({
      partialFailure: true,
      conversions: [
        {
          conversionAction: 'customers/6142700676/conversionActions/7861775516',
          conversionValue: 847,
          currencyCode: 'PLN',
          orderId: 'ORD-2026-000528',
          gclid: 'click-123',
          consent: { adUserData: 'GRANTED' },
          conversionDateTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/),
        },
      ],
    })
    expect(JSON.parse(String(init.body)).conversions[0]).not.toHaveProperty('adPersonalization')
    expect(String(fetchImpl.mock.calls.find((call) => String(call[0]).includes('google-analytics.com'))?.[0])).toContain(
      'measurement_id=G-SGHPWGL4P4'
    )
    expect(result?.ads?.status).toBe('sent')
    expect(result?.ga4?.status).toBe('sent')
  })

  it('sends the developer token and login customer id only when they are set, and records a partial failure', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('oauth2.googleapis.com')) {
        return new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
      }
      if (String(url).includes('uploadClickConversions')) {
        return new Response(JSON.stringify({ partialFailureError: { code: 3, message: 'The click ID is invalid.' } }), {
          status: 200,
        })
      }
      return new Response(null, { status: 204 })
    })

    const result = await trackPaidPaynowPurchase(
      { orderId: 'order-1', providerPaymentId: 'PAY-528', paymentEnvironment: 'production', paidAt: '2026-11-08T12:00:00.000Z' },
      {
        env: {
          ...enabledEnv(),
          googleAdsDeveloperToken: '  dev-token  ',
          googleAdsLoginCustomerId: '123-456-7890',
          googleAdsCustomerId: '614-270-0676',
        },
        fetchImpl: fetchImpl as unknown as typeof fetch,
        loadOrder: async () =>
          paidOrder({ attribution, ga4: { status: 'sent' }, ads: { status: 'pending' } }),
        saveTracking: async () => undefined,
      }
    )

    const adsCall = fetchImpl.mock.calls.find((call) => String(call[0]).includes('uploadClickConversions'))
    expect(adsCall?.[0]).toBe('https://googleads.googleapis.com/v23/customers/6142700676:uploadClickConversions')
    const headers = (adsCall?.[1] as RequestInit).headers as Record<string, string>
    expect(headers['developer-token']).toBe('dev-token')
    expect(headers['login-customer-id']).toBe('1234567890')
    expect(fetchImpl.mock.calls.some((call) => String(call[0]).includes('google-analytics.com'))).toBe(false)
    expect(result?.ga4?.status).toBe('sent')
    expect(result?.ads?.status).toBe('failed')
    expect(result?.ads?.reason).toBe('The click ID is invalid.')
  })
})
