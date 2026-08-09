"use client"

import { useCallback, useEffect, useState } from "react"
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  hasOptionalConsentGranted,
} from "@/features/cookie-consent"

export const shouldPlayNavbarLogoAnimation = (): boolean =>
  hasOptionalConsentGranted()

export const useNavbarLogoAnimation = (): boolean => {
  const [playAnimation, setPlayAnimation] = useState(false)

  const syncFromConsent = useCallback(() => {
    if (shouldPlayNavbarLogoAnimation()) {
      setPlayAnimation(true)
    }
  }, [])

  useEffect(() => {
    syncFromConsent()

    const handleAccepted = () => {
      setPlayAnimation(true)
    }

    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted)
    window.addEventListener("CookiebotOnAccept", handleAccepted)
    window.addEventListener("CookiebotOnConsentReady", syncFromConsent)

    const pollInterval = window.setInterval(syncFromConsent, 200)

    return () => {
      window.clearInterval(pollInterval)
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, handleAccepted)
      window.removeEventListener("CookiebotOnAccept", handleAccepted)
      window.removeEventListener("CookiebotOnConsentReady", syncFromConsent)
    }
  }, [syncFromConsent])

  return playAnimation
}
