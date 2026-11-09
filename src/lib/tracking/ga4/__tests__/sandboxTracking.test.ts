import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PurchaseData } from '../../types'
import { resetGa4StateForTests, trackGaPurchase } from '../events'
import { readSandboxTracking, resetSandboxTrackingForTests } from '@/lib/sandbox/trackingInspector'

const purchase = (): PurchaseData => ({
  content_name: 'Purchase Completed',
  content_ids: ['ORD-SANDBOX-1'],
  value: 10,
  currency: 'PLN',
  transaction_id: 'sandbox-txn-1',
  contents: [
    {
      id: 'mat-1',
      quantity: 1,
      item_price: 10,
      item_name: 'Synthetic mat',
    },
  ],
})

describe('sandbox purchase inspector', () => {
  beforeEach(() => {
    window.dataLayer = []
    delete window.gtag
    localStorage.clear()
    resetGa4StateForTests()
    resetSandboxTrackingForTests()
    vi.unstubAllEnvs()
  })

  it('records one purchase and conversion locally and does not call gtag', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview')

    trackGaPurchase(purchase())
    trackGaPurchase(purchase())

    expect(window.dataLayer).toEqual([])
    expect(readSandboxTracking()).toHaveLength(2)
    expect(readSandboxTracking()[0]).toMatchObject({
      channel: 'inspector',
      event: 'purchase',
      payload: { transaction_id: 'sandbox-txn-1', value: 10, currency: 'PLN' },
    })
    expect(readSandboxTracking()[1]).toMatchObject({
      channel: 'inspector',
      event: 'conversion',
      payload: {
        send_to: 'AW-18303682173/GGzWCPqk_MscEP2M8JdE',
        transaction_id: 'sandbox-txn-1',
        value: 10,
      },
    })
    expect(localStorage.getItem('ga4_purchase_sandbox-txn-1')).toBeTruthy()
  })

  it('keeps the live gtag purchase path when the runtime is not a sandbox', () => {
    trackGaPurchase(purchase())

    const events = (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))
    expect(events.filter((entry) => entry[1] === 'purchase')).toHaveLength(1)
    expect(events.filter((entry) => entry[1] === 'conversion')).toHaveLength(1)
    expect(readSandboxTracking()).toHaveLength(0)
  })
})
