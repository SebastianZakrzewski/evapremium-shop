'use client'

import { useCallback, useEffect, useState } from 'react'
import { applyStoredConsentToGtag } from '@/lib/tracking/ga4/consent'
import {
  acceptAllCookieConsent,
  readStoredConsentChoice,
  rejectAllCookieConsent,
  saveCookieConsentPreferences,
  shouldShowCustomBanner,
  syncCookiebotWithStoredChoice,
} from '../lib/consentStorage'

type UseCookieConsentReturn = {
  isBannerVisible: boolean
  isPreferencesOpen: boolean
  statisticsEnabled: boolean
  marketingEnabled: boolean
  handleAcceptAll: () => void
  handleRejectAll: () => void
  handleManagePreferences: () => void
  handleClosePreferences: () => void
  handleStatisticsChange: (enabled: boolean) => void
  handleMarketingChange: (enabled: boolean) => void
  handleSavePreferences: () => void
}

export const useCookieConsent = (): UseCookieConsentReturn => {
  const [isBannerVisible, setIsBannerVisible] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [statisticsEnabled, setStatisticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)

  const hideBanner = useCallback(() => {
    setIsBannerVisible(false)
    setIsPreferencesOpen(false)
  }, [])

  const publishChoice = useCallback(
    (save: () => void) => {
      save()
      applyStoredConsentToGtag()
      hideBanner()
    },
    [hideBanner]
  )

  useEffect(() => {
    setIsBannerVisible(shouldShowCustomBanner())

    const choice = readStoredConsentChoice()
    if (choice) {
      setStatisticsEnabled(choice.statistics)
      setMarketingEnabled(choice.marketing)
      applyStoredConsentToGtag()
    }
  }, [])

  useEffect(() => {
    const syncCookiebot = () => {
      syncCookiebotWithStoredChoice()
    }

    syncCookiebot()
    const intervalId = window.setInterval(syncCookiebot, 400)
    window.addEventListener('CookiebotOnLoad', syncCookiebot)
    window.addEventListener('CookiebotOnConsentReady', syncCookiebot)
    window.addEventListener('CookiebotOnDialogInit', syncCookiebot)

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId)
    }, 8000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
      window.removeEventListener('CookiebotOnLoad', syncCookiebot)
      window.removeEventListener('CookiebotOnConsentReady', syncCookiebot)
      window.removeEventListener('CookiebotOnDialogInit', syncCookiebot)
    }
  }, [])

  const handleAcceptAll = useCallback(() => {
    publishChoice(acceptAllCookieConsent)
  }, [publishChoice])

  const handleRejectAll = useCallback(() => {
    publishChoice(rejectAllCookieConsent)
  }, [publishChoice])

  const handleManagePreferences = useCallback(() => {
    const choice = readStoredConsentChoice()
    setStatisticsEnabled(choice?.statistics ?? false)
    setMarketingEnabled(choice?.marketing ?? false)
    setIsPreferencesOpen(true)
  }, [])

  const handleClosePreferences = useCallback(() => {
    setIsPreferencesOpen(false)
  }, [])

  const handleStatisticsChange = useCallback((enabled: boolean) => {
    setStatisticsEnabled(enabled)
  }, [])

  const handleMarketingChange = useCallback((enabled: boolean) => {
    setMarketingEnabled(enabled)
  }, [])

  const handleSavePreferences = useCallback(() => {
    publishChoice(() => saveCookieConsentPreferences(statisticsEnabled, marketingEnabled))
  }, [marketingEnabled, publishChoice, statisticsEnabled])

  return {
    isBannerVisible,
    isPreferencesOpen,
    statisticsEnabled,
    marketingEnabled,
    handleAcceptAll,
    handleRejectAll,
    handleManagePreferences,
    handleClosePreferences,
    handleStatisticsChange,
    handleMarketingChange,
    handleSavePreferences,
  }
}
