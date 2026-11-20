import { describe, expect, it } from 'vitest'
import {
  previewAdsBackfillPayload,
  selectAdsBackfillCandidates,
  type AdsBackfillOrder,
} from '../server/backfillAds'
import type { PurchaseTrackingRecord } from '../attribution/types'
import type { ServerTrackingEnv } from '../server/gate'

const now = new Date('2026-11-11T18:00:00.000Z')

const order = (
  overrides: Partial<AdsBackfillOrder> & { tracking?: PurchaseTrackingRecord | null }
): AdsBackfillOrder => ({
  id: overrides.id ?? 'order-1',
  orderNumber: overrides.orderNumber ?? 'ORD-2026-000536',
  paymentStatus: overrides.paymentStatus ?? 'paid',
  total: overrides.total ?? 990,
  createdAt: overrides.createdAt ?? new Date('2026-11-10T12:22:55.000Z'),
  purchaseTracking: overrides.tracking === undefined ? overrides.purchaseTracking ?? null : overrides.tracking,
})

const consented = (status: 'failed' | 'pending' | 'sent' | 'skipped', gclid = 'EAIaIQobChMI-example'): PurchaseTrackingRecord => ({
  attribution: {
    gclid,
    marketingConsent: true,
    statisticsConsent: true,
  },
  ads: { status, ...(status === 'skipped' ? { reason: 'marketing_consent_denied' } : {}) },
})

describe('selectAdsBackfillCandidates', () => {
  it('lists paid orders from the last 90 days with consent, a gclid, and a failed or pending upload', () => {
    const selected = selectAdsBackfillCandidates(
      [
        order({ id: '536', orderNumber: 'ORD-2026-000536', tracking: consented('failed') }),
        order({ id: '540', orderNumber: 'ORD-2026-000540', tracking: consented('pending', 'Cj0KCQiAwdDX-example') }),
        order({
          id: '535',
          orderNumber: 'ORD-2026-000535',
          tracking: {
            attribution: { gclid: 'EAIaIQobChMI-example', marketingConsent: false, statisticsConsent: true },
            ads: { status: 'skipped', reason: 'marketing_consent_denied' },
          },
        }),
        order({ id: 'sent', tracking: consented('sent') }),
        order({ id: 'old', createdAt: new Date('2026-07-01T00:00:00.000Z'), tracking: consented('failed') }),
        order({ id: 'unpaid', paymentStatus: 'pending', tracking: consented('failed') }),
        order({
          id: 'braid-only',
          orderNumber: 'ORD-2026-braid',
          tracking: {
            attribution: { gbraid: '0AAAABEL8Bn3-example', marketingConsent: true, statisticsConsent: true },
            ads: { status: 'failed' },
          },
        }),
      ],
      now
    )

    expect(selected.map((item) => item.orderNumber)).toEqual([
      'ORD-2026-000536',
      'ORD-2026-000540',
      'ORD-2026-braid',
    ])
    expect(selected[0]).toMatchObject({
      adsStatus: 'failed',
      clickIdField: 'gclid',
      clickIdPrefix: 'EAIaIQ…',
      total: 990,
    })
    expect(selected[0]?.clickIdPrefix).not.toContain('example')
    expect(selected[2]).toMatchObject({ clickIdField: 'gbraid', clickIdPrefix: '0AAAAB…' })
  })

  it('prints a redacted payload for the failed live orders using payments.paid_at and the order number', () => {
    const env: ServerTrackingEnv = {
      googleAdsCustomerId: '614-270-0676',
      googleAdsConversionAction: '7896361865',
    }
    const failed = [
      ['ORD-2026-000543', '2026-11-12T09:11:20.216Z', 595, '2026-11-12T10:11:20+01:00'],
      ['ORD-2026-000547', '2026-11-14T13:35:53.951Z', 435, '2026-11-14T14:35:53+01:00'],
      ['ORD-2026-000548', '2026-11-14T14:51:23.430Z', 667, '2026-11-14T15:51:23+01:00'],
      ['ORD-2026-000549', '2026-11-14T17:55:07.595Z', 707, '2026-11-14T18:55:07+01:00'],
      ['ORD-2026-000552', '2026-11-15T15:30:37.304Z', 847, '2026-11-15T16:30:37+01:00'],
      ['ORD-2026-000563', '2026-11-19T16:20:46.461Z', 707, '2026-11-19T17:20:46+01:00'],
    ] as const

    let total = 0
    for (const [orderNumber, paidAt, amount, eventTimestamp] of failed) {
      total += amount
      const payload = previewAdsBackfillPayload(
        order({
          id: orderNumber,
          orderNumber,
          total: amount,
          createdAt: new Date(paidAt),
          tracking: {
            attribution: {
              gclid: 'CjwKCAiAquDX-live-click',
              gbraid: '0AAAABEL8Bn2-live-braid',
              marketingConsent: true,
              statisticsConsent: true,
            },
            ads: { status: 'failed', reason: 'EVENT_TIME_INVALID' },
          },
        }),
        new Date(paidAt),
        env
      )
      expect(payload?.events[0]).toMatchObject({
        transactionId: orderNumber,
        eventTimestamp,
        eventSource: 'WEB',
        conversionValue: amount,
        currency: 'PLN',
        consent: { adUserData: 'CONSENT_GRANTED' },
        adIdentifiers: { gclid: 'CjwKCA…' },
      })
      expect(payload?.events[0]?.adIdentifiers).not.toHaveProperty('gbraid')
      expect(JSON.stringify(payload)).not.toContain('live-click')
      expect(JSON.stringify(payload)).not.toContain('live-braid')
      expect(payload?.destinations[0]).toEqual({
        operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '6142700676' },
        productDestinationId: '7896361865',
      })
      expect(new Date(eventTimestamp).toISOString()).toBe(
        new Date(Math.floor(new Date(paidAt).getTime() / 1000) * 1000).toISOString()
      )
    }
    expect(total).toBe(3958)
  })
})
