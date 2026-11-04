import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONSENT_MAX_AGE_SECONDS,
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_CHANGED_EVENT,
  acceptAllCookieConsent,
  buildConsentCookieAssignment,
  hasConsentForCategory,
  hasOptionalConsentGranted,
  hasStoredConsentDecision,
  isFullCookieConsentGranted,
  rejectAllCookieConsent,
  saveCookieConsentPreferences,
  shouldShowCustomBanner,
  syncCookiebotWithStoredChoice,
} from '../consentStorage'

const clearConsentCookie = () => {
  document.cookie = 'CookieConsent=; Max-Age=0; Path=/'
}

describe('consent cookie', () => {
  beforeEach(() => {
    clearConsentCookie()
    delete window.Cookiebot
  })

  it('stores an accept-all choice for 12 months without Cookiebot', () => {
    const assignment = buildConsentCookieAssignment({
      preferences: true,
      statistics: true,
      marketing: true,
    })

    expect(assignment).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`)
    expect(CONSENT_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365)
    expect(decodeURIComponent(assignment.split(';')[0].split('=').slice(1).join('='))).toContain(
      'statistics:true'
    )

    const onAccepted = vi.fn()
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted)

    acceptAllCookieConsent()

    expect(hasStoredConsentDecision()).toBe(true)
    expect(isFullCookieConsentGranted()).toBe(true)
    expect(hasConsentForCategory('statistics')).toBe(true)
    expect(hasConsentForCategory('marketing')).toBe(true)
    expect(shouldShowCustomBanner()).toBe(false)
    expect(onAccepted).toHaveBeenCalledTimes(1)

    window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted)
  })

  it('persists reject-all and keeps the banner hidden', () => {
    const onChanged = vi.fn()
    const onAccepted = vi.fn()
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged)
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted)

    rejectAllCookieConsent()

    expect(hasStoredConsentDecision()).toBe(true)
    expect(hasOptionalConsentGranted()).toBe(false)
    expect(hasConsentForCategory('statistics')).toBe(false)
    expect(hasConsentForCategory('marketing')).toBe(false)
    expect(shouldShowCustomBanner()).toBe(false)
    expect(onChanged).toHaveBeenCalledTimes(1)
    expect(onAccepted).not.toHaveBeenCalled()

    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onChanged)
    window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccepted)
  })

  it('saves statistics and marketing separately', () => {
    saveCookieConsentPreferences(true, false)

    expect(hasConsentForCategory('statistics')).toBe(true)
    expect(hasConsentForCategory('marketing')).toBe(false)
    expect(hasConsentForCategory('preferences')).toBe(false)
    expect(shouldShowCustomBanner()).toBe(false)
  })

  it('shows the banner only when no decision cookie exists', () => {
    expect(shouldShowCustomBanner()).toBe(true)

    document.cookie =
      "CookieConsent={stamp:'x',necessary:true,preferences:false,statistics:false,marketing:false,method:'explicit'}"

    expect(shouldShowCustomBanner()).toBe(false)
    expect(hasOptionalConsentGranted()).toBe(false)
  })

  it('mirrors a stored choice into Cookiebot when GTM has loaded it', () => {
    const submitCustomConsent = vi.fn()
    acceptAllCookieConsent()
    window.Cookiebot = {
      hasResponse: false,
      consent: {
        necessary: true,
        preferences: false,
        statistics: false,
        marketing: false,
        method: null,
      },
      submitCustomConsent,
    }

    expect(syncCookiebotWithStoredChoice()).toBe(true)
    expect(submitCustomConsent).toHaveBeenCalledWith(true, true, true)
  })
})
