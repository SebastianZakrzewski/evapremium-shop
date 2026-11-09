/**
 * Pure sandbox-isolation rules.
 * Production (VERCEL_ENV=production) is never sandboxed.
 * Preview, or an explicit SANDBOX_ISOLATION=enforce, fails closed.
 */

export const KNOWN_PRODUCTION_SUPABASE_PROJECT_REF = 'kmepxyervpeujwvgdqtm'

export const PRODUCTION_SHOP_HOSTS = ['evapremium.pl', 'www.evapremium.pl'] as const

export const PRODUCTION_PAYNOW_HOST = 'api.paynow.pl'
export const SANDBOX_PAYNOW_HOST = 'api.sandbox.paynow.pl'

export type SandboxScope = 'production' | 'sandbox' | 'local'

export type IsolationEnv = {
  vercelEnv?: string
  sandboxIsolation?: string
  supabaseUrl?: string
  sandboxProjectRef?: string
  paynowEnabled?: string
  paynowEnvironment?: string
  paynowApiKey?: string
  paynowSignatureKey?: string
  paynowReturnUrl?: string
  paynowNotificationUrl?: string
  vercelUrl?: string
  sandboxPublicHosts?: string
  bitrixEnabled?: string
  bitrixAutoSyncOrders?: string
  bitrixAutoSyncLeads?: string
  bitrixWebhookUrl?: string
  p24Enabled?: string
}

export type IsolationViolation = {
  code: string
  message: string
}

export type IsolationReport = {
  scope: SandboxScope
  ok: boolean
  violations: IsolationViolation[]
}

const trim = (value?: string): string => value?.trim() ?? ''

export const resolveSandboxScope = (env: IsolationEnv): SandboxScope => {
  if (trim(env.vercelEnv) === 'production') {
    return 'production'
  }

  if (trim(env.vercelEnv) === 'preview' || trim(env.sandboxIsolation) === 'enforce') {
    return 'sandbox'
  }

  return 'local'
}

export const normalizeHost = (value: string): string => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''

  const withProtocol = trimmed.includes('://') ? trimmed : `https://${trimmed}`

  try {
    return new URL(withProtocol).hostname
  } catch {
    return trimmed.split('/')[0]?.split(':')[0] ?? ''
  }
}

const supabaseHostForRef = (ref: string): string => `${ref}.supabase.co`

const isHttpsUrl = (value: string): boolean => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const allowedPublicHosts = (env: IsolationEnv): string[] => {
  const hosts = [trim(env.vercelUrl), ...trim(env.sandboxPublicHosts).split(',')]
    .map((host) => normalizeHost(host))
    .filter(Boolean)

  return Array.from(new Set(hosts))
}

const pushPaynowUrl = (
  violations: IsolationViolation[],
  code: string,
  label: string,
  value: string | undefined,
  allowedHosts: string[]
) => {
  const url = trim(value)
  if (!url) {
    violations.push({ code, message: `${label} is required in sandbox isolation` })
    return
  }

  if (!isHttpsUrl(url)) {
    violations.push({ code, message: `${label} must be https` })
    return
  }

  const host = normalizeHost(url)
  if (PRODUCTION_SHOP_HOSTS.includes(host as (typeof PRODUCTION_SHOP_HOSTS)[number]) || host === PRODUCTION_PAYNOW_HOST) {
    violations.push({ code, message: `${label} must not target production (${host})` })
    return
  }

  if (!allowedHosts.includes(host)) {
    violations.push({
      code,
      message: `${label} host must match VERCEL_URL or SANDBOX_PUBLIC_HOST`,
    })
  }
}

export const evaluateSandboxIsolation = (env: IsolationEnv): IsolationReport => {
  const scope = resolveSandboxScope(env)
  if (scope !== 'sandbox') {
    return { scope, ok: true, violations: [] }
  }

  const violations: IsolationViolation[] = []
  const sandboxRef = trim(env.sandboxProjectRef).toLowerCase()
  const supabaseUrl = trim(env.supabaseUrl)
  let supabaseHost = ''

  if (!supabaseUrl || !isHttpsUrl(supabaseUrl)) {
    violations.push({
      code: 'supabase_url',
      message: 'NEXT_PUBLIC_SUPABASE_URL must be the https URL of the sandbox project',
    })
  } else {
    supabaseHost = normalizeHost(supabaseUrl)
  }

  if (!sandboxRef) {
    violations.push({
      code: 'sandbox_project_ref',
      message: 'SANDBOX_SUPABASE_PROJECT_REF is required and must differ from production',
    })
  } else if (sandboxRef === KNOWN_PRODUCTION_SUPABASE_PROJECT_REF) {
    violations.push({
      code: 'sandbox_project_ref',
      message: 'SANDBOX_SUPABASE_PROJECT_REF must not be the production project',
    })
  }

  if (supabaseHost && sandboxRef && supabaseHost !== supabaseHostForRef(sandboxRef)) {
    violations.push({
      code: 'supabase_host',
      message: 'Supabase host must be the sandbox project ref, not another project',
    })
  }

  if (supabaseHost === supabaseHostForRef(KNOWN_PRODUCTION_SUPABASE_PROJECT_REF)) {
    violations.push({
      code: 'supabase_production_host',
      message: 'Sandbox runtime cannot use the production Supabase host',
    })
  }

  if (trim(env.paynowEnabled) !== 'true') {
    violations.push({
      code: 'paynow_enabled',
      message: 'PAYNOW_ENABLED must be true with sandbox credentials',
    })
  }

  if (trim(env.paynowEnvironment) !== 'sandbox') {
    violations.push({
      code: 'paynow_environment',
      message: 'PAYNOW_ENVIRONMENT must be exactly sandbox',
    })
  }

  if (!trim(env.paynowApiKey) || !trim(env.paynowSignatureKey)) {
    violations.push({
      code: 'paynow_credentials',
      message: 'Sandbox Paynow API key and signature key must be set',
    })
  }

  const allowedHosts = allowedPublicHosts(env)
  if (allowedHosts.length === 0) {
    violations.push({
      code: 'sandbox_public_host',
      message: 'VERCEL_URL or SANDBOX_PUBLIC_HOST must identify the sandbox site',
    })
  }

  pushPaynowUrl(violations, 'paynow_return_url', 'PAYNOW_RETURN_URL', env.paynowReturnUrl, allowedHosts)
  pushPaynowUrl(
    violations,
    'paynow_notification_url',
    'PAYNOW_NOTIFICATION_URL',
    env.paynowNotificationUrl,
    allowedHosts
  )

  if (trim(env.bitrixEnabled) === 'true' || trim(env.bitrixWebhookUrl)) {
    violations.push({
      code: 'bitrix_webhook',
      message: 'BITRIX24_WEBHOOK_ENABLED and BITRIX24_WEBHOOK_URL must be unset in sandbox',
    })
  }

  if (trim(env.bitrixAutoSyncOrders) === 'true' || trim(env.bitrixAutoSyncLeads) === 'true') {
    violations.push({
      code: 'bitrix_autosync',
      message: 'Bitrix auto-sync must be off in sandbox',
    })
  }

  if (trim(env.p24Enabled) === 'true') {
    violations.push({
      code: 'p24_enabled',
      message: 'P24_ENABLED must not be true in sandbox',
    })
  }

  return { scope, ok: violations.length === 0, violations }
}

export class SandboxIsolationError extends Error {
  readonly violations: IsolationViolation[]

  constructor(violations: IsolationViolation[]) {
    super(`Sandbox isolation checks failed: ${violations.map((item) => item.code).join(', ')}`)
    this.name = 'SandboxIsolationError'
    this.violations = violations
  }
}
