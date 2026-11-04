'use client'

import { useEffect } from 'react'
import { readGoogleConsent } from '@/lib/tracking/ga4/consent'
import { pushGtag } from '@/lib/tracking/ga4/gtag'

const CONSENT_EVENTS = [
  'CookiebotOnAccept',
  'CookiebotOnDecline',
  'CookiebotOnConsentReady',
] as const

export function GoogleConsentMode() {
  useEffect(() => {
    const syncConsent = () => {
      pushGtag('consent', 'update', readGoogleConsent())
    }

    syncConsent()

    CONSENT_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, syncConsent)
    })

    return () => {
      CONSENT_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, syncConsent)
      })
    }
  }, [])

  return null
}
