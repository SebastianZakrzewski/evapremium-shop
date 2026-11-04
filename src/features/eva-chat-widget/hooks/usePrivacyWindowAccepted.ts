import { useEffect, useState } from 'react'
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_CHANGED_EVENT,
  hasOptionalConsentGranted,
} from '@/features/cookie-consent'

export const usePrivacyWindowAccepted = (): boolean => {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const syncFromConsent = () => {
      if (hasOptionalConsentGranted()) {
        setAccepted(true)
      }
    }

    syncFromConsent()

    const handleAccepted = () => {
      setAccepted(true)
    }

    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted)
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncFromConsent)
    window.addEventListener('CookiebotOnAccept', syncFromConsent)
    window.addEventListener('CookiebotOnConsentReady', syncFromConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted)
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncFromConsent)
      window.removeEventListener('CookiebotOnAccept', syncFromConsent)
      window.removeEventListener('CookiebotOnConsentReady', syncFromConsent)
    }
  }, [])

  return accepted
}
