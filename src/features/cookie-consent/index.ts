export { CookieConsentBanner } from './components/CookieConsentBanner'
export { useCookieConsent } from './hooks/useCookieConsent'
export {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  acceptAllCookieConsent,
  dispatchCookieConsentAccepted,
  getConsentCookieValue,
  hasConsentForCategory,
  hasOptionalConsentGranted,
  hasStoredConsentDecision,
  isFullCookieConsentGranted,
  persistConsentChoice,
  readStoredConsentChoice,
  rejectAllCookieConsent,
  saveCookieConsentPreferences,
  shouldShowCustomBanner,
  syncCookiebotWithStoredChoice,
} from './lib/consentStorage'
export type { ConsentChoice, CookieConsentCategory } from './lib/consentStorage'
