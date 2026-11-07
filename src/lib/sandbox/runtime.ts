import {
  evaluateSandboxIsolation,
  resolveSandboxScope,
  SandboxIsolationError,
  type IsolationEnv,
  type IsolationReport,
} from './isolationPolicy'

export const readIsolationEnv = (): IsolationEnv => ({
  vercelEnv: process.env.VERCEL_ENV,
  sandboxIsolation: process.env.SANDBOX_ISOLATION,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  sandboxProjectRef: process.env.SANDBOX_SUPABASE_PROJECT_REF,
  paynowEnabled: process.env.PAYNOW_ENABLED,
  paynowEnvironment: process.env.PAYNOW_ENVIRONMENT,
  paynowApiKey: process.env.PAYNOW_API_KEY,
  paynowSignatureKey: process.env.PAYNOW_SIGNATURE_KEY,
  paynowReturnUrl: process.env.PAYNOW_RETURN_URL,
  paynowNotificationUrl: process.env.PAYNOW_NOTIFICATION_URL,
  vercelUrl: process.env.VERCEL_URL,
  sandboxPublicHosts: process.env.SANDBOX_PUBLIC_HOST,
  bitrixEnabled: process.env.BITRIX24_WEBHOOK_ENABLED,
  bitrixAutoSyncOrders: process.env.BITRIX24_AUTO_SYNC_ORDERS,
  bitrixAutoSyncLeads: process.env.BITRIX24_AUTO_SYNC_LEADS,
  bitrixWebhookUrl: process.env.BITRIX24_WEBHOOK_URL,
  p24Enabled: process.env.P24_ENABLED,
})

/** Client bundles only see NEXT_PUBLIC_* values inlined at build time. */
export const readTrackingScopeEnv = (): Pick<IsolationEnv, 'vercelEnv' | 'sandboxIsolation'> => ({
  vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.VERCEL_ENV,
  sandboxIsolation: process.env.NEXT_PUBLIC_SANDBOX_ISOLATION || process.env.SANDBOX_ISOLATION,
})

export const currentIsolationReport = (): IsolationReport => evaluateSandboxIsolation(readIsolationEnv())

export const isSandboxScope = (): boolean => currentIsolationReport().scope === 'sandbox'

export const isSandboxTrackingScope = (): boolean =>
  resolveSandboxScope(readTrackingScopeEnv()) === 'sandbox'

export const assertSandboxDataPlane = (): void => {
  const report = currentIsolationReport()
  if (report.scope === 'sandbox' && !report.ok) {
    throw new SandboxIsolationError(report.violations)
  }
}
