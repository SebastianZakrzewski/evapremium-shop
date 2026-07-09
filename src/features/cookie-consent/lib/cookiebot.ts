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

  if (!hasStoredCookieConsent()) {
    return false
  }

  const consentCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith(`${COOKIEBOT_CONSENT_COOKIE}=`))

  if (!consentCookie) {
    return false
  }

  const value = decodeURIComponent(consentCookie.split('=').slice(1).join('='))

  return (
    value.includes('necessary:true') &&
    value.includes('preferences:true') &&
    value.includes('statistics:true') &&
    value.includes('marketing:true')
  )
}

const submitFullConsentToCookiebot = (cookiebot: CookiebotApi): boolean => {
  if (cookiebot.dialog?.submitConsent) {
    cookiebot.dialog.submitConsent()
    cookiebot.runScripts?.()
    suppressDefaultCookiebotUi()
    return true
  }

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
