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

export const getCookiebot = (): CookiebotApi | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.Cookiebot
}

export const hideDefaultCookiebotDialog = (): void => {
  getCookiebot()?.hide()
}

export const acceptAllCookieConsent = (): void => {
  getCookiebot()?.submitCustomConsent(true, true, true)
}

export const openCookiebotPreferences = (): void => {
  getCookiebot()?.renew()
}
