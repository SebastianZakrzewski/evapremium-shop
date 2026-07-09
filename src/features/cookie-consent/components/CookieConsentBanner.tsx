'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '../hooks/useCookieConsent'

const BANNER_TITLE = 'Cenimy Twoją prywatność'

const BANNER_DESCRIPTION =
  'Aby zapewnić Ci najlepsze wrażenia na naszej stronie, używamy plików cookie. Dzięki nim możemy analizować ruch, dostosowywać treści i prowadzić działania marketingowe. Więcej informacji znajdziesz w naszej'

export const CookieConsentBanner = () => {
  const { isBannerVisible, handleAcceptAll, handleManagePreferences } = useCookieConsent()

  if (!isBannerVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-4 md:p-6"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="w-full max-w-[720px] rounded-2xl bg-white px-5 py-6 shadow-2xl sm:px-8 sm:py-8 md:px-10 md:py-9"
      >
        <h2
          id="cookie-consent-title"
          className="text-left text-[1.35rem] font-semibold leading-tight text-black sm:text-2xl"
        >
          {BANNER_TITLE}
        </h2>

        <p
          id="cookie-consent-description"
          className="mt-4 text-left text-[0.95rem] leading-7 text-neutral-700 sm:mt-5 sm:text-base sm:leading-7"
        >
          {BANNER_DESCRIPTION}{' '}
          <Link
            href="/polityka-prywatnosci"
            className="font-medium text-neutral-900 underline underline-offset-[3px] transition-colors hover:text-black"
          >
            Polityka prywatności
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <button
            type="button"
            onClick={handleManagePreferences}
            className="order-2 self-start text-left text-sm text-neutral-800 underline underline-offset-[3px] transition-colors hover:text-black sm:order-1"
            aria-label="Zarządzaj preferencjami plików cookie"
          >
            Zarządzaj preferencjami
          </button>

          <Button
            type="button"
            onClick={handleAcceptAll}
            className="order-1 h-12 w-full rounded-md bg-black px-5 text-sm font-medium text-white hover:bg-neutral-900 sm:order-2 sm:h-11 sm:w-auto sm:min-w-[260px] sm:shrink-0"
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
