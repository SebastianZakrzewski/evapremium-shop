export type CookieConsentCategory =
  | 'necessary'
  | 'preferences'
  | 'statistics'
  | 'marketing'

export type ConsentChoice = {
  preferences: boolean
  statistics: boolean
  marketing: boolean
}

type CookiebotConsent = ConsentChoice & {
  necessary: boolean
  method: string | null
}

type CookiebotApi = {
  consent?: CookiebotConsent
  hasResponse?: boolean
  submitCustomConsent?: (
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

/** Same name Cookiebot used, so an existing decision still hides the banner. */
export const COOKIE_CONSENT_COOKIE = 'CookieConsent'

/** 12 months. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export const COOKIE_CONSENT_ACCEPTED_EVENT = 'evaCookieConsentAccepted'

export const COOKIE_CONSENT_CHANGED_EVENT = 'evaCookieConsentChanged'

const flag = (allowed: boolean): string => (allowed ? 'true' : 'false')

export const serializeConsentChoice = (choice: ConsentChoice): string => {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

  return `{stamp:'${stamp}',necessary:true,preferences:${flag(choice.preferences)},statistics:${flag(choice.statistics)},marketing:${flag(choice.marketing)},method:'explicit',ver:1,utc:${Date.now()},region:'pl'}`
}

export const buildConsentCookieAssignment = (choice: ConsentChoice): string => {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''

  return `${COOKIE_CONSENT_COOKIE}=${encodeURIComponent(serializeConsentChoice(choice))}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
}

export const getConsentCookieValue = (): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const consentCookie = document.cookie
    .split(';')
    .find((cookie) => cookie.trim().startsWith(`${COOKIE_CONSENT_COOKIE}=`))

  if (!consentCookie) {
    return null
  }

  const rawValue = consentCookie.split('=').slice(1).join('=')

  try {
    return decodeURIComponent(rawValue)
  } catch {
    return rawValue
  }
}

export const readStoredConsentChoice = (): ConsentChoice | null => {
  const value = getConsentCookieValue()

  if (!value || !value.includes('necessary:true')) {
    return null
  }

  return {
    preferences: value.includes('preferences:true'),
    statistics: value.includes('statistics:true'),
    marketing: value.includes('marketing:true'),
  }
}

export const hasStoredConsentDecision = (): boolean => readStoredConsentChoice() !== null

export const hasConsentForCategory = (category: CookieConsentCategory): boolean => {
  if (category === 'necessary') {
    return true
  }

  const choice = readStoredConsentChoice()

  if (!choice) {
    return false
  }

  return choice[category]
}

export const hasOptionalConsentGranted = (): boolean => {
  const choice = readStoredConsentChoice()

  if (!choice) {
    return false
  }

  return choice.preferences || choice.statistics || choice.marketing
}

export const isFullCookieConsentGranted = (): boolean => {
  const choice = readStoredConsentChoice()

  if (!choice) {
    return false
  }

  return choice.preferences && choice.statistics && choice.marketing
}

/** Banner stays hidden after any stored choice, including reject-all. */
export const shouldShowCustomBanner = (): boolean => !hasStoredConsentDecision()

const dispatchConsentChanged = (choice: ConsentChoice): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT))

  if (choice.preferences || choice.statistics || choice.marketing) {
    window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT))
  }
}

export const dispatchCookieConsentAccepted = (): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_ACCEPTED_EVENT))
}

/**
 * GTM-TD2WDGKV still injects Cookiebot. Mirror our stored choice into it so
 * its Consent Mode tag does not leave storage denied after the visitor chose.
 */
export const syncCookiebotWithStoredChoice = (): boolean => {
  const choice = readStoredConsentChoice()
  const cookiebot = typeof window !== 'undefined' ? window.Cookiebot : undefined

  if (!choice || !cookiebot || typeof cookiebot.submitCustomConsent !== 'function') {
    return false
  }

  const consent = cookiebot.consent
  const alreadyApplied =
    cookiebot.hasResponse === true &&
    consent?.statistics === choice.statistics &&
    consent?.marketing === choice.marketing &&
    consent?.preferences === choice.preferences

  if (alreadyApplied) {
    return true
  }

  try {
    cookiebot.submitCustomConsent(choice.preferences, choice.statistics, choice.marketing)
  } catch {
    return false
  }

  return true
}

export const persistConsentChoice = (choice: ConsentChoice): void => {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = buildConsentCookieAssignment(choice)
  syncCookiebotWithStoredChoice()
  dispatchConsentChanged(choice)
}

export const acceptAllCookieConsent = (): ConsentChoice => {
  const choice: ConsentChoice = {
    preferences: true,
    statistics: true,
    marketing: true,
  }

  persistConsentChoice(choice)

  return choice
}

export const rejectAllCookieConsent = (): ConsentChoice => {
  const choice: ConsentChoice = {
    preferences: false,
    statistics: false,
    marketing: false,
  }

  persistConsentChoice(choice)

  return choice
}

export const saveCookieConsentPreferences = (
  statistics: boolean,
  marketing: boolean
): ConsentChoice => {
  const choice: ConsentChoice = {
    preferences: false,
    statistics,
    marketing,
  }

  persistConsentChoice(choice)

  return choice
}
