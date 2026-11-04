import Script from 'next/script'
import { GA_CONSENT_DEFAULT_SCRIPT } from '@/lib/tracking/ga4/consentScript'

export function GoogleConsentDefaultScript() {
  return (
    <Script
      id="ga-consent-default"
      strategy="beforeInteractive"
      data-cookieconsent="ignore"
      dangerouslySetInnerHTML={{ __html: GA_CONSENT_DEFAULT_SCRIPT }}
    />
  )
}
