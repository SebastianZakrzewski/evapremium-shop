import Script from 'next/script'
import { buildGa4InitScript } from '@/lib/tracking/ga4/consentScript'
import { getGaMeasurementId } from '@/lib/tracking/ga4/measurementId'

/**
 * Direct gtag.js for our GA4 property. Page views on SPA navigations are left
 * to GA4 enhanced measurement (history changes). Do not also emit page_view.
 */
export function GoogleAnalyticsScript() {
  const measurementId = getGaMeasurementId()

  return (
    <>
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        data-cookieconsent="ignore"
        dangerouslySetInnerHTML={{ __html: buildGa4InitScript(measurementId) }}
      />
      <Script
        id="ga4-loader"
        strategy="afterInteractive"
        data-cookieconsent="ignore"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  )
}
