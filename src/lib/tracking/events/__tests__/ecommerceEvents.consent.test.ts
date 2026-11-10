import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pageViewMock, initMock, trackMock } = vi.hoisted(() => ({
  pageViewMock: vi.fn(),
  initMock: vi.fn(),
  trackMock: vi.fn(),
}))

vi.mock('../../providers/FacebookPixelProvider', () => ({
  FacebookPixelProvider: vi.fn().mockImplementation(function () {
    return {
      init: initMock,
      pageView: pageViewMock,
      track: trackMock,
    }
  }),
}))

vi.mock('@/lib/config/tracking', () => ({
  getTrackingConfigInstance: () => ({
    enabled: true,
    debug: false,
  }),
}))

vi.mock('../../consent/isMarketingTrackingAllowed', () => ({
  isMarketingTrackingAllowed: vi.fn(),
}))

import { isMarketingTrackingAllowed } from '../../consent/isMarketingTrackingAllowed'
import { resetTrackingProviderForTests, trackAddPaymentInfo, trackPageView } from '../ecommerceEvents'

describe('trackPageView consent gating', () => {
  beforeEach(() => {
    pageViewMock.mockClear()
    initMock.mockClear()
    trackMock.mockClear()
    vi.mocked(isMarketingTrackingAllowed).mockReset()
    resetTrackingProviderForTests()
  })

  it('does not track page view without marketing consent', () => {
    vi.mocked(isMarketingTrackingAllowed).mockReturnValue(false)

    trackPageView({
      content_name: 'Home',
      page_path: '/',
    })

    expect(pageViewMock).not.toHaveBeenCalled()
    expect(initMock).not.toHaveBeenCalled()
  })

  it('tracks page view when marketing consent is granted', () => {
    vi.mocked(isMarketingTrackingAllowed).mockReturnValue(true)

    trackPageView({
      content_name: 'Home',
      page_path: '/',
    })

    expect(initMock).toHaveBeenCalledTimes(1)
    expect(pageViewMock).toHaveBeenCalledTimes(1)
  })

  it('still sends AddPaymentInfo to Facebook when marketing consent is granted', () => {
    vi.mocked(isMarketingTrackingAllowed).mockReturnValue(true)

    trackAddPaymentInfo({
      content_name: 'Payment Info Added',
      content_category: 'checkout',
      value: 499,
      currency: 'PLN',
      payment_method: 'paynow',
      contents: [
        { id: 'mat-1', quantity: 1, item_price: 499, item_name: 'Dywaniki EVA' },
      ],
    })

    expect(trackMock).toHaveBeenCalledWith(
      'AddPaymentInfo',
      expect.objectContaining({ payment_method: 'paynow', value: 499 })
    )
  })
})
