/**
 * TrackingProvider - inicjalizuje tracking dopiero po uzyskaniu zgody Cookiebot
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePageView } from '@/lib/tracking/hooks/usePageView'
import { getTrackingConfigInstance } from '@/lib/config/tracking'
import { FacebookPixelProvider } from '@/lib/tracking/providers/FacebookPixelProvider'
import { hasConsentForCategory } from '@/features/cookie-consent'
import { loadMicrosoftClarity } from '@/lib/tracking/consent/loadMicrosoftClarity'

const CONSENT_EVENTS = [
  'CookiebotOnAccept',
  'CookiebotOnDecline',
  'CookiebotOnConsentReady',
] as const

let providerInstance: FacebookPixelProvider | null = null

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const config = getTrackingConfigInstance()
  const marketingInitializedRef = useRef(false)
  const clarityInitializedRef = useRef(false)

  const initMarketingTracking = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!config.enabled || marketingInitializedRef.current) {
      return
    }

    if (!hasConsentForCategory('marketing')) {
      return
    }

    if (!providerInstance) {
      providerInstance = new FacebookPixelProvider()
      providerInstance.init({
        enabled: config.enabled,
        debug: config.debug,
      })
    }

    marketingInitializedRef.current = true
  }, [config.enabled, config.debug])

  const initStatisticsTracking = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (clarityInitializedRef.current) {
      return
    }

    if (!hasConsentForCategory('statistics')) {
      return
    }

    loadMicrosoftClarity()
    clarityInitializedRef.current = true
  }, [])

  useEffect(() => {
    const handleConsentChange = () => {
      initMarketingTracking()
      initStatisticsTracking()
    }

    handleConsentChange()

    CONSENT_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleConsentChange)
    })

    return () => {
      CONSENT_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleConsentChange)
      })
    }
  }, [initMarketingTracking, initStatisticsTracking])

  usePageView()

  return <>{children}</>
}
