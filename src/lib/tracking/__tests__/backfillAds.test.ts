import { describe, expect, it } from 'vitest'
import { selectAdsBackfillCandidates, type AdsBackfillOrder } from '../server/backfillAds'
import type { PurchaseTrackingRecord } from '../attribution/types'

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
          tracking: {
            attribution: { gbraid: 'braid-1', marketingConsent: true, statisticsConsent: true },
            ads: { status: 'failed' },
          },
        }),
      ],
      now
    )

    expect(selected.map((item) => item.orderNumber)).toEqual(['ORD-2026-000536', 'ORD-2026-000540'])
    expect(selected[0]).toMatchObject({ adsStatus: 'failed', gclidPrefix: 'EAIaIQ…', total: 990 })
    expect(selected[0]?.gclidPrefix).not.toContain('example')
  })
})
