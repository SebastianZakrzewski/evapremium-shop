export { getGaMeasurementId, DEFAULT_GA_MEASUREMENT_ID } from './measurementId'
export { GA_CONSENT_DEFAULT_SCRIPT, buildGa4InitScript } from './consentScript'
export { readGoogleConsent, mapGoogleConsent, applyStoredConsentToGtag, DENIED_GOOGLE_CONSENT } from './consent'
export type { GoogleConsentUpdate } from './consent'
export { pushGtag } from './gtag'
export {
  trackGaAddPaymentInfo,
  trackGaAddShippingInfo,
  trackGaAddToCart,
  trackGaBeginCheckout,
  trackGaGenerateLead,
  trackGaPurchase,
  trackGaViewContent,
  trackGaViewItem,
  resetGa4StateForTests,
} from './events'
export type { Ga4Item } from './events'
