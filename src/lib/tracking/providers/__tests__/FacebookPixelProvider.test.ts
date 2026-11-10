import { afterEach, describe, expect, it, vi } from 'vitest'
import { FacebookPixelProvider } from '../FacebookPixelProvider'

describe('FacebookPixelProvider pixel id', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    delete window.fbq
  })

  it('trims a trailing CRLF before fbq init', () => {
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '716765280860813\r\n')
    const fbq = vi.fn()
    window.fbq = fbq as unknown as Window['fbq']

    new FacebookPixelProvider().init({ enabled: true })

    expect(fbq).toHaveBeenCalledWith('init', '716765280860813', {
      autoConfig: true,
      debug: false,
    })
  })

  it('does not init when the pixel id is only whitespace', () => {
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '\r\n')
    const fbq = vi.fn()
    window.fbq = fbq as unknown as Window['fbq']

    const provider = new FacebookPixelProvider()
    provider.init({ enabled: true })

    expect(fbq).not.toHaveBeenCalled()
    expect(provider.isInitialized()).toBe(false)
  })
})
