import { afterEach, describe, expect, it } from 'vitest'
import { GA_CONSENT_DEFAULT_SCRIPT, buildGa4InitScript } from '../consentScript'
import { readGoogleConsent } from '../consent'
import { acceptAllCookieConsent, rejectAllCookieConsent } from '@/features/cookie-consent/lib/consentStorage'

type GtagCall = {
  0: string
  1: string
  2?: { analytics_storage?: string; ad_storage?: string }
}

const clearConsentCookie = () => {
  document.cookie = 'CookieConsent=; Max-Age=0; Path=/'
}

const runConsentDefaultScript = () => {
  window.dataLayer = []
  delete window.gtag
  new Function(GA_CONSENT_DEFAULT_SCRIPT)()
}

const consentUpdates = (): GtagCall[] =>
  ((window.dataLayer ?? []) as unknown as GtagCall[]).filter(
    (call) => call[0] === 'consent' && call[1] === 'update'
  )

describe('GA4 consent', () => {
  afterEach(() => {
    clearConsentCookie()
    delete window.Cookiebot
    window.dataLayer = []
    delete window.gtag
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

  it('grants storage from the stored cookie before gtag config runs', () => {
    acceptAllCookieConsent()
    runConsentDefaultScript()

    expect(consentUpdates()[0]?.[2]).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'granted',
    })
    expect(readGoogleConsent()).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      security_storage: 'granted',
    })
  })

  it('keeps storage denied when the stored choice is reject-all', () => {
    rejectAllCookieConsent()
    runConsentDefaultScript()

    expect(consentUpdates()[0]?.[2]).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
    })
    expect(readGoogleConsent().analytics_storage).toBe('denied')
  })

  it('ignores a Cookiebot memory grant when the cookie says denied', () => {
    rejectAllCookieConsent()
    window.Cookiebot = {
      hasResponse: true,
      consent: {
        necessary: true,
        preferences: true,
        statistics: true,
        marketing: true,
        method: 'explicit',
      },
    }

    expect(readGoogleConsent()).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
    })
  })
})
