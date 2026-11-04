import { afterEach, describe, expect, it } from 'vitest'
import { GA_CONSENT_DEFAULT_SCRIPT, buildGa4InitScript } from '../consentScript'
import { readGoogleConsent } from '../consent'
import type { CookiebotApi } from '@/features/cookie-consent/lib/cookiebot'

const setCookiebot = (cookiebot: Partial<CookiebotApi> | undefined) => {
  if (!cookiebot) {
    delete window.Cookiebot
    return
  }

  window.Cookiebot = cookiebot as CookiebotApi
}

describe('GA4 consent', () => {
  afterEach(() => {
    document.cookie = 'CookieConsent=; Max-Age=0'
    delete window.Cookiebot
  })

  it('keeps the shared dataLayer and denies storage by default', () => {
    expect(GA_CONSENT_DEFAULT_SCRIPT).toContain('window.dataLayer = window.dataLayer || []')
    expect(GA_CONSENT_DEFAULT_SCRIPT).not.toContain('window.dataLayer = []')
    expect(GA_CONSENT_DEFAULT_SCRIPT).toContain("analytics_storage: 'denied'")
    expect(GA_CONSENT_DEFAULT_SCRIPT).toContain("ad_user_data: 'denied'")
    expect(GA_CONSENT_DEFAULT_SCRIPT).toContain("ad_personalization: 'denied'")
    expect(GA_CONSENT_DEFAULT_SCRIPT).toContain("granted('statistics')")
  })

  it('configures gtag without disabling the initial page view', () => {
    const script = buildGa4InitScript('G-SGHPWGL4P4')

    expect(script).toContain("gtag('config', 'G-SGHPWGL4P4')")
    expect(script).toContain('window.dataLayer = window.dataLayer || []')
    expect(script).not.toContain('send_page_view')
  })

  it('reads a stored Cookiebot cookie before Cookiebot has responded', () => {
    document.cookie = 'CookieConsent=' + encodeURIComponent('statistics:true,marketing:false,preferences:true')
    setCookiebot({
      hasResponse: false,
      consent: {
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
        method: null,
      },
    })

    expect(readGoogleConsent()).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    })
  })

  it('uses a settled Cookiebot response over the cookie', () => {
    document.cookie = 'CookieConsent=' + encodeURIComponent('statistics:false,marketing:false,preferences:false')
    setCookiebot({
      hasResponse: true,
      consent: {
        necessary: true,
        preferences: false,
        statistics: true,
        marketing: true,
        method: 'explicit',
      },
    })

    expect(readGoogleConsent()).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})
