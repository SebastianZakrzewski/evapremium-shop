import { getConsentCookieValue } from '@/features/cookie-consent/lib/consentStorage'
import { pushGtag } from './gtag'

export type GoogleConsentState = 'granted' | 'denied'

export type GoogleConsentUpdate = {
  ad_storage: GoogleConsentState
  ad_user_data: GoogleConsentState
  ad_personalization: GoogleConsentState
  analytics_storage: GoogleConsentState
  functionality_storage: GoogleConsentState
  personalization_storage: GoogleConsentState
  security_storage: 'granted'
}

type ConsentFlags = {
  statistics: boolean
  marketing: boolean
  preferences: boolean
}

const stateFor = (allowed: boolean): GoogleConsentState =>
  allowed ? 'granted' : 'denied'

export const DENIED_GOOGLE_CONSENT: GoogleConsentUpdate = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
}

export const mapGoogleConsent = (flags: ConsentFlags): GoogleConsentUpdate => ({
  analytics_storage: stateFor(flags.statistics),
  ad_storage: stateFor(flags.marketing),
  ad_user_data: stateFor(flags.marketing),
  ad_personalization: stateFor(flags.marketing),
  functionality_storage: stateFor(flags.preferences),
  personalization_storage: stateFor(flags.preferences),
  security_storage: 'granted',
})

const readFlagsFromCookie = (value: string): ConsentFlags => ({
  statistics: value.includes('statistics:true'),
  marketing: value.includes('marketing:true'),
  preferences: value.includes('preferences:true'),
})

/**
 * The first-party CookieConsent cookie is the source of truth.
 * Cookiebot, when GTM injects it, must not override a stored choice.
 */
export const readGoogleConsent = (): GoogleConsentUpdate => {
  const cookieValue = getConsentCookieValue()

  if (!cookieValue || !cookieValue.includes('necessary:true')) {
    return DENIED_GOOGLE_CONSENT
  }

  return mapGoogleConsent(readFlagsFromCookie(cookieValue))
}

export const applyStoredConsentToGtag = (): void => {
  pushGtag('consent', 'update', readGoogleConsent())
}
