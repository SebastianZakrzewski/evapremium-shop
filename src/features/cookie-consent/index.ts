export { CookieConsentBanner } from './components/CookieConsentBanner'
export { useCookieConsent } from './hooks/useCookieConsent'
export {
  acceptAllCookieConsent,
  closeCookiebotPreferencesPanel,
  getCookiebot,
  getConsentCookieValue,
  hasOptionalConsentGranted,
  hasStoredCookieConsent,
  hideCookiebotWidget,
  hideDefaultCookiebotDialog,
  isFullCookieConsentGranted,
  openCookiebotPreferences,
  shouldShowCustomBanner,
  suppressDefaultCookiebotUi,
} from './lib/cookiebot'
