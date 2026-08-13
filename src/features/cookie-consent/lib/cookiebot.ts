export type CookieConsentCategory =
  | 'necessary'
  | 'preferences'
  | 'statistics'
  | 'marketing'

export type CookiebotConsent = {
  necessary: boolean
  preferences: boolean
  statistics: boolean
  marketing: boolean
  method: string | null
}

export type CookiebotApi = {
  consent: CookiebotConsent
  consented: boolean
  declined: boolean
  hasResponse: boolean
  hide: () => void
  show: () => void
  renew: () => void
  runScripts?: () => void
  dialog?: {
    submitConsent: () => void
    submitDecline: () => void
  }
  submitCustomConsent: (
    optinPreferences: boolean,
    optinStatistics: boolean,
    optinMarketing: boolean
  ) => void
}

declare global {
  interface Window {
    Cookiebot?: CookiebotApi
  }
}

export const COOKIEBOT_CONSENT_COOKIE = 'CookieConsent'

/** Dispatched when the user accepts cookies — navbar logo listens to start its animation. */
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'evaCookieConsentAccepted'

export const dispatchCookieConsentAccepted = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT))
}

export const getCookiebot = (): CookiebotApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.Cookiebot
}

export const hasStoredCookieConsent = (): boolean => {
  if (typeof document === 'undefined') {
    return false
  }

  return document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith(`${COOKIEBOT_CONSENT_COOKIE}=`))
}

export const hideDefaultCookiebotDialog = (): void => {
  getCookiebot()?.hide()
}

export const hideCookiebotWidget = (): void => {
  if (typeof document === 'undefined') {
    return
  }

  const widget = document.getElementById('CookiebotWidget')

  if (widget) {
    widget.style.setProperty('display', 'none', 'important')
  }
}

export const suppressDefaultCookiebotUi = (): void => {
  if (typeof document === 'undefined') {
    return
  }

  if (document.body?.getAttribute('data-cookiebot-preferences') === 'open') {
    return
  }

  hideDefaultCookiebotDialog()
  hideCookiebotWidget()
}

export const getConsentCookieValue = (): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const consentCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith(`${COOKIEBOT_CONSENT_COOKIE}=`))

  if (!consentCookie) {
    return null
  }

  return decodeURIComponent(consentCookie.split('=').slice(1).join('='))
}

const hasConsentCategoryInCookie = (
  value: string,
  category: CookieConsentCategory
): boolean => value.includes(`${category}:true`)

export const hasConsentForCategory = (
  category: CookieConsentCategory
): boolean => {
  const cookiebot = getCookiebot()

  if (cookiebot?.consent) {
    return cookiebot.consent[category]
  }

  const value = getConsentCookieValue()

  if (!value) {
    return false
  }

  return hasConsentCategoryInCookie(value, category)
}

export const hasOptionalConsentGranted = (): boolean => {
  const value = getConsentCookieValue()

  if (value) {
    const hasOptionalFromCookie =
      value.includes('preferences:true') ||
      value.includes('statistics:true') ||
      value.includes('marketing:true')

    if (hasOptionalFromCookie) {
      return true
    }
  }

  const cookiebot = getCookiebot()

  if (cookiebot?.consent) {
    return (
      cookiebot.consent.preferences ||
      cookiebot.consent.statistics ||
      cookiebot.consent.marketing
    )
  }

  return false
}

/**
 * Banner widoczny gdy:
 * - brak aktywnej zgody opcjonalnej (pierwsza wizyta, odmowa, wycofanie)
 * Ukryty gdy użytkownik zaakceptował jakąkolwiek kategorię opcjonalną,
 * do momentu wygaśnięcia cookie Cookiebot (lifecycle).
 */
export const shouldShowCustomBanner = (): boolean => !hasOptionalConsentGranted()

export const isFullCookieConsentGranted = (): boolean => {
  const cookiebot = getCookiebot()

  if (cookiebot?.consent) {
    return (
      cookiebot.consent.necessary &&
      cookiebot.consent.preferences &&
      cookiebot.consent.statistics &&
      cookiebot.consent.marketing
    )
  }

  const value = getConsentCookieValue()

  if (!value) {
    return false
  }

  return (
    value.includes('necessary:true') &&
    value.includes('preferences:true') &&
    value.includes('statistics:true') &&
    value.includes('marketing:true')
  )
}

const submitFullConsentToCookiebot = (cookiebot: CookiebotApi): boolean => {
  cookiebot.submitCustomConsent(true, true, true)
  cookiebot.runScripts?.()
  suppressDefaultCookiebotUi()

  return cookiebot.hasResponse || isFullCookieConsentGranted()
}

export const acceptAllCookieConsent = (onComplete?: () => void): void => {
  const submitConsent = (): boolean => {
    const cookiebot = getCookiebot()

    if (!cookiebot) {
      return false
    }

    return submitFullConsentToCookiebot(cookiebot)
  }

  if (submitConsent()) {
    onComplete?.()
    return
  }

  let attempts = 0

  const intervalId = window.setInterval(() => {
    attempts += 1

    if (submitConsent() || attempts >= 50) {
      window.clearInterval(intervalId)
      onComplete?.()
    }
  }, 100)
}

export const openCookiebotPreferences = (): void => {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-cookiebot-preferences', 'open')
  }

  getCookiebot()?.renew()
}

export const closeCookiebotPreferencesPanel = (): void => {
  if (typeof document !== 'undefined') {
    document.body.removeAttribute('data-cookiebot-preferences')
  }

  suppressDefaultCookiebotUi()
}
