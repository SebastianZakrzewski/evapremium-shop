import Script from 'next/script'
import { GA_CONSENT_DEFAULT_SCRIPT } from '@/lib/tracking/ga4/consentScript'
import { isSandboxTrackingScope } from '@/lib/sandbox/runtime'

export function GoogleConsentDefaultScript() {
  if (isSandboxTrackingScope()) {
    return null
  }

  return (
    <Script
      id="ga-consent-default"
      strategy="beforeInteractive"
      data-cookieconsent="ignore"
      dangerouslySetInnerHTML={{ __html: GA_CONSENT_DEFAULT_SCRIPT }}
    />
  )
}
