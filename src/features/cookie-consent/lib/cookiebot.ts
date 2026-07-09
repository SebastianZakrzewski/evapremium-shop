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

export const acceptAllCookieConsent = (): void => {
  getCookiebot()?.submitCustomConsent(true, true, true)
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
