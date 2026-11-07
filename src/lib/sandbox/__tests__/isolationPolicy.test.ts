import { afterEach, describe, expect, it } from 'vitest'
import {
  evaluateSandboxIsolation,
  KNOWN_PRODUCTION_SUPABASE_PROJECT_REF,
  resolveSandboxScope,
  type IsolationEnv,
} from '../isolationPolicy'

const SANDBOX_REF = 'aaaaaaaaaaaaaaaaaaaa'
const SANDBOX_HOST = 'preview-alias.vercel.app'

const readySandbox = (): IsolationEnv => ({
  vercelEnv: 'preview',
  supabaseUrl: `https://${SANDBOX_REF}.supabase.co`,
  sandboxProjectRef: SANDBOX_REF,
  paynowEnabled: 'true',
  paynowEnvironment: 'sandbox',
  paynowApiKey: 'sandbox-api-key',
  paynowSignatureKey: 'sandbox-signature-key',
  paynowReturnUrl: `https://${SANDBOX_HOST}/payment/success`,
  paynowNotificationUrl: `https://${SANDBOX_HOST}/api/payments/paynow/webhook`,
  sandboxPublicHosts: SANDBOX_HOST,
  bitrixEnabled: 'false',
  bitrixAutoSyncOrders: 'false',
  bitrixWebhookUrl: '',
  p24Enabled: 'false',
})

const codes = (env: IsolationEnv) => evaluateSandboxIsolation(env).violations.map((item) => item.code)

describe('sandbox isolation policy', () => {
  afterEach(() => {
    delete process.env.VERCEL_ENV
    delete process.env.SANDBOX_ISOLATION
  })

  it('keeps production behavior even if sandbox flags are present', () => {
    const report = evaluateSandboxIsolation({
      ...readySandbox(),
      vercelEnv: 'production',
      supabaseUrl: `https://${KNOWN_PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`,
      sandboxProjectRef: KNOWN_PRODUCTION_SUPABASE_PROJECT_REF,
      paynowEnvironment: 'production',
      paynowReturnUrl: 'https://evapremium.pl/payment/success',
      bitrixEnabled: 'true',
      bitrixWebhookUrl: 'https://example.bitrix24.pl/rest/1/hook/',
      bitrixAutoSyncOrders: 'true',
      p24Enabled: 'true',
    })

    expect(report.scope).toBe('production')
    expect(report.ok).toBe(true)
    expect(report.violations).toEqual([])
    expect(resolveSandboxScope({ vercelEnv: 'production', sandboxIsolation: 'enforce' })).toBe('production')
  })

  it('leaves local development unrestricted unless isolation is enforced', () => {
    expect(resolveSandboxScope({})).toBe('local')
    expect(evaluateSandboxIsolation({}).ok).toBe(true)
    expect(resolveSandboxScope({ sandboxIsolation: 'enforce' })).toBe('sandbox')
  })

  it('accepts a preview runtime only when data, paynow, and CRM are isolated', () => {
    const report = evaluateSandboxIsolation(readySandbox())
    expect(report.scope).toBe('sandbox')
    expect(report.ok).toBe(true)
  })

  it('fails closed instead of using the production database or payment hosts', () => {
    expect(codes({
      ...readySandbox(),
      supabaseUrl: `https://${KNOWN_PRODUCTION_SUPABASE_PROJECT_REF}.supabase.co`,
      sandboxProjectRef: KNOWN_PRODUCTION_SUPABASE_PROJECT_REF,
    })).toEqual(expect.arrayContaining(['sandbox_project_ref', 'supabase_production_host']))

    expect(codes({
      ...readySandbox(),
      supabaseUrl: 'https://some-other-project.supabase.co',
    })).toContain('supabase_host')

    expect(codes({
      ...readySandbox(),
      paynowEnvironment: 'production',
      paynowReturnUrl: 'https://evapremium.pl/payment/success',
      paynowNotificationUrl: 'https://www.evapremium.pl/api/payments/paynow/webhook',
    })).toEqual(expect.arrayContaining(['paynow_environment', 'paynow_return_url', 'paynow_notification_url']))

    expect(codes({
      ...readySandbox(),
      paynowEnvironment: '',
    })).toContain('paynow_environment')
  })

  it('fails closed when CRM or P24 production integrations are enabled', () => {
    expect(codes({
      ...readySandbox(),
      bitrixEnabled: 'true',
      bitrixWebhookUrl: 'https://example.bitrix24.pl/rest/1/hook/',
      bitrixAutoSyncOrders: 'true',
      p24Enabled: 'true',
    })).toEqual(expect.arrayContaining(['bitrix_webhook', 'bitrix_autosync', 'p24_enabled']))
  })
})
