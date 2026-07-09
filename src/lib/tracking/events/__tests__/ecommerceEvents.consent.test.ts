import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pageViewMock, initMock } = vi.hoisted(() => ({
  pageViewMock: vi.fn(),
  initMock: vi.fn(),
}))

vi.mock('../../providers/FacebookPixelProvider', () => ({
  FacebookPixelProvider: vi.fn().mockImplementation(() => ({
    init: initMock,
    pageView: pageViewMock,
    track: vi.fn(),
  })),
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
import { resetTrackingProviderForTests, trackPageView } from '../ecommerceEvents'

describe('trackPageView consent gating', () => {
  beforeEach(() => {
    pageViewMock.mockClear()
    initMock.mockClear()
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
})
