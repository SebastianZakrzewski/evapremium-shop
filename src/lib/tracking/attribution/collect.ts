import {
  type ClickIds,
  type PurchaseAttribution,
  sanitizeClickId,
} from './types'

export const CLICK_ID_COOKIE = 'eva_click_ids'
export const CLICK_ID_STORAGE_KEY = 'eva_click_ids'
export const CLICK_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 90
export const GA_SESSION_COOKIE = '_ga_SGHPWGL4P4'

const emptyClickIds = (): ClickIds => ({})

export const parseGaClientId = (gaCookie: string | null | undefined): string | undefined => {
  if (!gaCookie) return undefined
  const match = gaCookie.trim().match(/^GA\d+\.\d+\.(\d+\.\d+)$/)
  return sanitizeClickId(match?.[1])
}

export const parseGaSessionId = (sessionCookie: string | null | undefined): string | undefined => {
  if (!sessionCookie) return undefined
  const value = sessionCookie.trim()
  const gs1 = value.match(/^GS\d+\.\d+\.(\d+)/)
  if (gs1) return sanitizeClickId(gs1[1])
  const gs2 = value.match(/(?:^|[.$])s(\d+)/)
  return sanitizeClickId(gs2?.[1])
}

/** `_gcl_aw` is `GCL.<timestamp>.<gclid>`. */
export const parseGclAw = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined
  const parts = value.trim().split('.')
  if (parts[0] !== 'GCL' || parts.length < 3) return undefined
  return sanitizeClickId(parts.slice(2).join('.'))
}

export const clickIdsFromSearch = (search: string): ClickIds => {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const ids: ClickIds = {}
  const gclid = sanitizeClickId(params.get('gclid'))
  const gbraid = sanitizeClickId(params.get('gbraid'))
  const wbraid = sanitizeClickId(params.get('wbraid'))
  if (gclid) ids.gclid = gclid
  if (gbraid) ids.gbraid = gbraid
  if (wbraid) ids.wbraid = wbraid
  return ids
}

export const mergeClickIds = (current: ClickIds, incoming: ClickIds): ClickIds => ({
  gclid: incoming.gclid || current.gclid,
  gbraid: incoming.gbraid || current.gbraid,
  wbraid: incoming.wbraid || current.wbraid,
})

export const parseStoredClickIds = (raw: string | null | undefined): ClickIds => {
  if (!raw) return emptyClickIds()
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return mergeClickIds(emptyClickIds(), {
      gclid: sanitizeClickId(parsed.gclid),
      gbraid: sanitizeClickId(parsed.gbraid),
      wbraid: sanitizeClickId(parsed.wbraid),
    })
  } catch {
    return emptyClickIds()
  }
}

const readCookie = (cookieString: string, name: string): string | undefined => {
  const part = cookieString
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
  if (!part) return undefined
  const raw = part.slice(name.length + 1)
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

const consentFromCookie = (cookieString: string): { statistics: boolean; marketing: boolean } => {
  const value = readCookie(cookieString, 'CookieConsent')
  if (!value || !value.includes('necessary:true')) {
    return { statistics: false, marketing: false }
  }
  return {
    statistics: value.includes('statistics:true'),
    marketing: value.includes('marketing:true'),
  }
}

export const collectPurchaseAttribution = (input: {
  cookieString?: string
  search?: string
  storedClickIds?: string | null
  now?: string
}): PurchaseAttribution => {
  const cookies = input.cookieString ?? ''
  const fromStore = parseStoredClickIds(input.storedClickIds ?? readCookie(cookies, CLICK_ID_COOKIE))
  const fromUrl = clickIdsFromSearch(input.search ?? '')
  const fromGcl = parseGclAw(readCookie(cookies, '_gcl_aw'))
  const clickIds = mergeClickIds(mergeClickIds(fromStore, fromUrl), fromGcl ? { gclid: fromGcl } : {})
  const consent = consentFromCookie(cookies)

  return {
    ...clickIds,
    gaClientId: parseGaClientId(readCookie(cookies, '_ga')),
    gaSessionId: parseGaSessionId(readCookie(cookies, GA_SESSION_COOKIE)),
    statisticsConsent: consent.statistics,
    marketingConsent: consent.marketing,
    capturedAt: input.now,
  }
}

export const collectPurchaseAttributionFromBrowser = (): PurchaseAttribution | undefined => {
  if (typeof window === 'undefined') return undefined
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(CLICK_ID_STORAGE_KEY)
  } catch {
    stored = null
  }
  return collectPurchaseAttribution({
    cookieString: document.cookie,
    search: window.location.search,
    storedClickIds: stored,
    now: new Date().toISOString(),
  })
}

export const persistLandingClickIds = (search: string): void => {
  if (typeof window === 'undefined') return
  const incoming = clickIdsFromSearch(search)
  if (!incoming.gclid && !incoming.gbraid && !incoming.wbraid) return

  let storedRaw: string | null = null
  try {
    storedRaw = window.localStorage.getItem(CLICK_ID_STORAGE_KEY)
  } catch {
    storedRaw = null
  }
  const cookieRaw = readCookie(document.cookie, CLICK_ID_COOKIE)
  const merged = mergeClickIds(parseStoredClickIds(storedRaw || cookieRaw), incoming)
  const serialized = JSON.stringify(merged)

  try {
    window.localStorage.setItem(CLICK_ID_STORAGE_KEY, serialized)
  } catch {
    // Private mode can reject storage. The cookie still carries the ids.
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CLICK_ID_COOKIE}=${encodeURIComponent(serialized)}; Max-Age=${CLICK_ID_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
}
