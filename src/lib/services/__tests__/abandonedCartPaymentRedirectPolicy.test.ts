import { describe, expect, it } from 'vitest'
import { isAbandonedPaymentRedirectEvent } from '../abandonedCartPaymentRedirectPolicy'

describe('isAbandonedPaymentRedirectEvent', () => {
  it('detects payment_redirect event', () => {
    expect(isAbandonedPaymentRedirectEvent({ event: 'payment_redirect' })).toBe(true)
  })

  it('detects metadata.paymentRedirect', () => {
    expect(
      isAbandonedPaymentRedirectEvent({
        event: 'pagehide',
        metadata: { paymentRedirect: true },
      })
    ).toBe(true)
  })

  it('ignores normal pagehide', () => {
    expect(isAbandonedPaymentRedirectEvent({ event: 'pagehide' })).toBe(false)
    expect(
      isAbandonedPaymentRedirectEvent({
        event: 'pagehide',
        metadata: { stage: 'checkout_step3' },
      })
    ).toBe(false)
  })
})
