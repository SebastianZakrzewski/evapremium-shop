import { afterEach, describe, expect, it, vi } from 'vitest'
import { getTrackingConfig, resetTrackingConfig } from '../tracking'

describe('getTrackingConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    resetTrackingConfig()
  })

  it('trims a trailing CRLF from NEXT_PUBLIC_FB_PIXEL_ID', () => {
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '716765280860813\r\n')

    expect(getTrackingConfig().NEXT_PUBLIC_FB_PIXEL_ID).toBe('716765280860813')
  })

  it('drops a whitespace-only pixel id', () => {
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', ' \r\n')

    expect(getTrackingConfig().NEXT_PUBLIC_FB_PIXEL_ID).toBeUndefined()
  })
})
