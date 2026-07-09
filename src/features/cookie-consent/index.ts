export { CookieConsentBanner } from './components/CookieConsentBanner'
export { useCookieConsent } from './hooks/useCookieConsent'
export {
  acceptAllCookieConsent,
  closeCookiebotPreferencesPanel,
  getCookiebot,
  getConsentCookieValue,
  hasConsentForCategory,
  hasOptionalConsentGranted,
  hasStoredCookieConsent,
  hideCookiebotWidget,
  hideDefaultCookiebotDialog,
  isFullCookieConsentGranted,
  openCookiebotPreferences,
  shouldShowCustomBanner,
  suppressDefaultCookiebotUi,
} from './lib/cookiebot'
export type { CookieConsentCategory } from './lib/cookiebot'
