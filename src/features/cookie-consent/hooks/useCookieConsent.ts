'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  acceptAllCookieConsent,
  closeCookiebotPreferencesPanel,
  dispatchCookieConsentAccepted,
  getCookiebot,
  openCookiebotPreferences,
  shouldShowCustomBanner,
  suppressDefaultCookiebotUi,
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
    suppressDefaultCookiebotUi()

    if (!shouldShowCustomBanner()) {
      setIsBannerVisible(false)
      isManagingPreferencesRef.current = false
      closeCookiebotPreferencesPanel()
      return
    }

    if (isManagingPreferencesRef.current) {
      setIsBannerVisible(false)
      return
    }

    setIsBannerVisible(true)
  }, [])

  const handleConsentSettled = useCallback(() => {
    isManagingPreferencesRef.current = false
    closeCookiebotPreferencesPanel()
    syncBannerVisibility()
  }, [syncBannerVisibility])

  const handleDialogInit = useCallback(() => {
    if (isManagingPreferencesRef.current) {
      return
    }

    suppressDefaultCookiebotUi()
    syncBannerVisibility()
  }, [syncBannerVisibility])

  useEffect(() => {
    if (shouldShowCustomBanner()) {
      setIsBannerVisible(true)
    }

    suppressDefaultCookiebotUi()
    syncBannerVisibility()

    const pollInterval = window.setInterval(() => {
      suppressDefaultCookiebotUi()

      if (getCookiebot()) {
        syncBannerVisibility()
      }
    }, 100)

    window.addEventListener('CookiebotOnConsentReady', syncBannerVisibility)
    window.addEventListener('CookiebotOnDialogInit', handleDialogInit)
    window.addEventListener('CookiebotOnLoad', syncBannerVisibility)
    window.addEventListener('CookiebotOnAccept', handleConsentSettled)
    window.addEventListener('CookiebotOnDecline', handleConsentSettled)

    return () => {
      window.clearInterval(pollInterval)
      window.removeEventListener('CookiebotOnConsentReady', syncBannerVisibility)
      window.removeEventListener('CookiebotOnDialogInit', handleDialogInit)
      window.removeEventListener('CookiebotOnLoad', syncBannerVisibility)
      window.removeEventListener('CookiebotOnAccept', handleConsentSettled)
      window.removeEventListener('CookiebotOnDecline', handleConsentSettled)
    }
  }, [handleConsentSettled, handleDialogInit, syncBannerVisibility])

  const handleAcceptAll = useCallback(() => {
    acceptAllCookieConsent(() => {
      isManagingPreferencesRef.current = false
      closeCookiebotPreferencesPanel()
      setIsBannerVisible(false)
      dispatchCookieConsentAccepted()
    })
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
