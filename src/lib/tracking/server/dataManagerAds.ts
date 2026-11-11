import type { ServerTrackingEnv } from './gate'
import { adsProductDestinationId } from './plan'
import type { DataManagerAdsEvent } from './plan'

export const DATA_MANAGER_INGEST_URL = 'https://datamanager.googleapis.com/v1/events:ingest'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
/** Bounds the Paynow webhook. A slow Google call must not hold checkout. */
export const GOOGLE_REQUEST_TIMEOUT_MS = 8_000
const MAX_REASON_LENGTH = 500

export type DataManagerDestination = {
  operatingAccount: { accountType: 'GOOGLE_ADS'; accountId: string }
  loginAccount?: { accountType: 'GOOGLE_ADS'; accountId: string }
  productDestinationId: string
}

export type DataManagerIngestBody = {
  destinations: DataManagerDestination[]
  events: DataManagerAdsEvent[]
  consent: { adUserData: 'CONSENT_GRANTED' }
}

export type DataManagerIngestResult = {
  requestId: string
  warning?: string
}

const truncate = (value: string): string =>
  value.length <= MAX_REASON_LENGTH ? value : `${value.slice(0, MAX_REASON_LENGTH - 1)}…`

export const googleAdsCustomerId = (value: string | undefined): string =>
  (value ?? '').replace(/-/g, '').trim()

/**
 * Operating account is the Ads customer that owns the conversion action.
 * Login account is set only when a manager id is configured. Data Manager
 * then checks that the OAuth user is a user of that manager and that the
 * manager is a parent of the operating account.
 */
export const buildDataManagerIngestBody = (
  env: ServerTrackingEnv,
  event: DataManagerAdsEvent
): DataManagerIngestBody => {
  const destination: DataManagerDestination = {
    operatingAccount: {
      accountType: 'GOOGLE_ADS',
      accountId: googleAdsCustomerId(env.googleAdsCustomerId),
    },
    productDestinationId: adsProductDestinationId(env) as string,
  }
  const loginId = googleAdsCustomerId(env.googleAdsLoginCustomerId)
  if (loginId) {
    destination.loginAccount = { accountType: 'GOOGLE_ADS', accountId: loginId }
  }
  return {
    destinations: [destination],
    events: [event],
    consent: { adUserData: 'CONSENT_GRANTED' },
  }
}

type FieldViolation = { field?: string; description?: string; reason?: string }

export const formatOAuthError = (status: number, body: unknown): string => {
  if (body && typeof body === 'object') {
    const payload = body as { error?: string; error_description?: string }
    const detail = [payload.error, payload.error_description].filter(Boolean).join(': ')
    if (detail) return truncate(`Google OAuth HTTP ${status}: ${detail}`)
  }
  if (typeof body === 'string' && body.trim()) {
    return truncate(`Google OAuth HTTP ${status}: ${body.trim()}`)
  }
  return `Google OAuth HTTP ${status}`
}

export const formatDataManagerError = (status: number, body: unknown): string => {
  if (!body || typeof body !== 'object') {
    const suffix = typeof body === 'string' && body.trim() ? `: ${body.trim()}` : ''
    return truncate(`Data Manager HTTP ${status}${suffix}`)
  }
  const error = (
    body as {
      error?: { message?: string; status?: string; details?: unknown[] }
    }
  ).error
  if (!error) return truncate(`Data Manager HTTP ${status}`)

  const violations: string[] = []
  for (const detail of error.details ?? []) {
    if (!detail || typeof detail !== 'object') continue
    const list = (detail as { fieldViolations?: FieldViolation[] }).fieldViolations ?? []
    for (const violation of list) {
      const bits = [violation.field, violation.reason, violation.description].filter(Boolean)
      if (bits.length > 0) violations.push(bits.join(': '))
    }
    const infoReason = (detail as { reason?: string }).reason
    if (infoReason && list.length === 0) violations.push(infoReason)
  }
  const head = [error.status, error.message].filter(Boolean).join(' ')
  return truncate(`Data Manager HTTP ${status}: ${[head, ...violations].filter(Boolean).join('; ')}`)
}

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

const timeoutSignal = (): AbortSignal => AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS)

export const fetchGoogleAccessToken = async (
  env: ServerTrackingEnv,
  fetchImpl: typeof fetch
): Promise<string> => {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: env.googleAdsClientId as string,
    client_secret: env.googleAdsClientSecret as string,
    refresh_token: env.googleAdsRefreshToken as string,
  })
  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: timeoutSignal(),
  })
  const payload = await readBody(response)
  if (!response.ok) {
    throw new Error(formatOAuthError(response.status, payload))
  }
  const token =
    payload && typeof payload === 'object'
      ? (payload as { access_token?: string }).access_token
      : undefined
  if (!token) throw new Error('Google OAuth response missing access_token')
  return token
}

const warningText = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') return undefined
  const warnings = (payload as { fieldWarnings?: FieldViolation[] }).fieldWarnings ?? []
  if (warnings.length === 0) return undefined
  return truncate(
    warnings
      .slice(0, 3)
      .map((warning) => [warning.field, warning.reason, warning.description].filter(Boolean).join(': '))
      .filter(Boolean)
      .join('; ')
  )
}

export const ingestAdsClickEvent = async (
  env: ServerTrackingEnv,
  event: DataManagerAdsEvent,
  fetchImpl: typeof fetch
): Promise<DataManagerIngestResult> => {
  const token = await fetchGoogleAccessToken(env, fetchImpl)
  const response = await fetchImpl(DATA_MANAGER_INGEST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildDataManagerIngestBody(env, event)),
    signal: timeoutSignal(),
  })
  const payload = await readBody(response)
  if (!response.ok) {
    throw new Error(formatDataManagerError(response.status, payload))
  }
  const requestId =
    payload && typeof payload === 'object'
      ? (payload as { requestId?: string }).requestId
      : undefined
  if (!requestId) throw new Error('Data Manager response missing requestId')
  return { requestId, warning: warningText(payload) }
}

export const adsFailureReason = (error: unknown): string => {
  if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
    return 'Google Ads request timed out'
  }
  return error instanceof Error ? error.message : 'ads_failed'
}
