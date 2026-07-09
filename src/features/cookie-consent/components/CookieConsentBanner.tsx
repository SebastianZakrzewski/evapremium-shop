'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '../hooks/useCookieConsent'

const BANNER_TITLE = 'Cenimy Twoją prywatność'

export const CookieConsentBanner = () => {
  const { isBannerVisible, handleAcceptAll, handleManagePreferences } = useCookieConsent()

  if (!isBannerVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl sm:p-8 md:p-10"
      >
        <h2
          id="cookie-consent-title"
          className="text-lg font-semibold text-black sm:text-xl"
        >
          {BANNER_TITLE}
        </h2>

        <p
          id="cookie-consent-description"
          className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base"
        >
          Aby zapewnić Ci najlepsze wrażenia na naszej stronie, używamy plików cookie.
          Dzięki nim możemy analizować ruch, dostosowywać treści i prowadzić działania
          marketingowe. Więcej informacji znajdziesz w naszej{' '}
          <Link
            href="/polityka-prywatnosci"
            className="font-medium text-gray-800 underline underline-offset-2 hover:text-black"
          >
            Polityce prywatności
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleManagePreferences}
            className="text-left text-sm text-gray-700 underline underline-offset-2 transition-colors hover:text-black"
            aria-label="Zarządzaj preferencjami plików cookie"
          >
            Zarządzaj preferencjami
          </button>

          <Button
            type="button"
            onClick={handleAcceptAll}
            className="h-11 rounded-md bg-black px-6 text-sm font-medium text-white hover:bg-gray-900 sm:min-w-[240px]"
            aria-label="Akceptuję pliki cookie i przechodzę dalej"
          >
            Akceptuję i przechodzę dalej
          </Button>
        </div>
      </section>
    </div>
  )
}

export default CookieConsentBanner
