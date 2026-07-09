import { hasConsentForCategory } from '@/features/cookie-consent'

export const isMarketingTrackingAllowed = (): boolean =>
  hasConsentForCategory('marketing')
