'use client'

import { useEffect } from 'react'
import { COOKIE_CONSENT_CHANGED_EVENT } from '@/features/cookie-consent/lib/consentStorage'
import { applyStoredConsentToGtag } from '@/lib/tracking/ga4/consent'

const CONSENT_EVENTS = [
  COOKIE_CONSENT_CHANGED_EVENT,
  'CookiebotOnAccept',
  'CookiebotOnDecline',
  'CookiebotOnConsentReady',
] as const

export function GoogleConsentMode() {
  useEffect(() => {
    const syncConsent = () => {
      applyStoredConsentToGtag()
    }

    const syncAfterExternalCmp = () => {
      syncConsent()
      window.setTimeout(syncConsent, 0)
      window.setTimeout(syncConsent, 300)
    }

    syncConsent()
    const delayedSync = [300, 1000, 2200].map((delay) => window.setTimeout(syncConsent, delay))

    CONSENT_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, syncAfterExternalCmp)
    })

    return () => {
      delayedSync.forEach((timeoutId) => window.clearTimeout(timeoutId))
      CONSENT_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, syncAfterExternalCmp)
      })
    }
  }, [])

  return null
}
