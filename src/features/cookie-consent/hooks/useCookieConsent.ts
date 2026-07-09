'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  acceptAllCookieConsent,
  getCookiebot,
  hideDefaultCookiebotDialog,
  openCookiebotPreferences,
} from '../lib/cookiebot'

type UseCookieConsentReturn = {
  isBannerVisible: boolean
  handleAcceptAll: () => void
  handleManagePreferences: () => void
}

export const useCookieConsent = (): UseCookieConsentReturn => {
  const [isBannerVisible, setIsBannerVisible] = useState(false)
  const isManagingPreferencesRef = useRef(false)

  const syncBannerVisibility = useCallback(() => {
    const cookiebot = getCookiebot()

    if (!cookiebot) {
      return
    }

    if (cookiebot.hasResponse) {
      setIsBannerVisible(false)
      isManagingPreferencesRef.current = false
      return
    }

    if (isManagingPreferencesRef.current) {
      setIsBannerVisible(false)
      return
    }

    hideDefaultCookiebotDialog()
    setIsBannerVisible(true)
  }, [])

  const handleConsentSettled = useCallback(() => {
    isManagingPreferencesRef.current = false
    setIsBannerVisible(false)
  }, [])

  const handleDialogInit = useCallback(() => {
    if (isManagingPreferencesRef.current) {
      return
    }

    hideDefaultCookiebotDialog()
    syncBannerVisibility()
  }, [syncBannerVisibility])

  useEffect(() => {
    syncBannerVisibility()

    window.addEventListener('CookiebotOnConsentReady', syncBannerVisibility)
    window.addEventListener('CookiebotOnDialogInit', handleDialogInit)
    window.addEventListener('CookiebotOnAccept', handleConsentSettled)
    window.addEventListener('CookiebotOnDecline', handleConsentSettled)

    return () => {
      window.removeEventListener('CookiebotOnConsentReady', syncBannerVisibility)
      window.removeEventListener('CookiebotOnDialogInit', handleDialogInit)
      window.removeEventListener('CookiebotOnAccept', handleConsentSettled)
      window.removeEventListener('CookiebotOnDecline', handleConsentSettled)
    }
  }, [handleConsentSettled, handleDialogInit, syncBannerVisibility])

  const handleAcceptAll = useCallback(() => {
    acceptAllCookieConsent()
    isManagingPreferencesRef.current = false
    setIsBannerVisible(false)
  }, [])

  const handleManagePreferences = useCallback(() => {
    isManagingPreferencesRef.current = true
    setIsBannerVisible(false)
    openCookiebotPreferences()
  }, [])

  return {
    isBannerVisible,
    handleAcceptAll,
    handleManagePreferences,
  }
}
