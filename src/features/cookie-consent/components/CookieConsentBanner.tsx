'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '../hooks/useCookieConsent'

const BANNER_TITLE = 'Cenimy Twoją prywatność'

const BANNER_DESCRIPTION =
  'Aby zapewnić Ci najlepsze wrażenia na naszej stronie, używamy plików cookie. Dzięki nim możemy analizować ruch, dostosowywać treści i prowadzić działania marketingowe. Możesz zaakceptować wszystkie, odrzucić je albo zapisać własny wybór. Więcej informacji znajdziesz w naszej'

const choiceButtonClassName =
  'h-auto min-h-12 w-full flex-1 basis-0 whitespace-normal px-4 py-3 text-sm font-medium'

export const CookieConsentBanner = () => {
  const {
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
  } = useCookieConsent()

  if (!isBannerVisible) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4 md:p-6"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="pointer-events-auto w-full max-w-[720px] rounded-2xl bg-white px-5 py-6 shadow-2xl sm:px-8 sm:py-8 md:px-10 md:py-9"
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
            className="whitespace-nowrap font-medium text-neutral-900 underline underline-offset-[3px] transition-colors hover:text-black"
          >
            Polityka prywatności
          </Link>
          .
        </p>

        {isPreferencesOpen ? (
          <fieldset className="mt-6 space-y-4 border-0 p-0">
            <legend className="text-left text-sm font-medium text-black">
              Wybierz kategorie plików cookie
            </legend>
            <label htmlFor="cookie-statistics" className="flex cursor-pointer items-start gap-3 text-left">
              <input
                id="cookie-statistics"
                type="checkbox"
                checked={statisticsEnabled}
                onChange={(event) => handleStatisticsChange(event.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="block text-sm font-medium text-black">Statystyka</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-600">
                  Pomiar odwiedzin i sposobu korzystania ze strony (Google Analytics).
                </span>
              </span>
            </label>
            <label htmlFor="cookie-marketing" className="flex cursor-pointer items-start gap-3 text-left">
              <input
                id="cookie-marketing"
                type="checkbox"
                checked={marketingEnabled}
                onChange={(event) => handleMarketingChange(event.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span>
                <span className="block text-sm font-medium text-black">Marketing</span>
                <span className="mt-1 block text-sm leading-6 text-neutral-600">
                  Pomiar i dopasowanie reklam (Google Ads).
                </span>
              </span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleClosePreferences}
                className="h-11 w-full border-black bg-white text-black hover:bg-neutral-100 sm:w-auto"
              >
                Wróć
              </Button>
              <Button
                type="button"
                onClick={handleSavePreferences}
                className="h-11 w-full bg-black text-white hover:bg-neutral-900 sm:w-auto"
              >
                Zapisz wybór
              </Button>
            </div>
          </fieldset>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-stretch">
          <Button
            type="button"
            variant="outline"
            onClick={handleRejectAll}
            className={`${choiceButtonClassName} border-2 border-black bg-white text-black hover:bg-neutral-100`}
            aria-label="Odrzuć"
          >
            Odrzuć
          </Button>
          <Button
            type="button"
            onClick={handleAcceptAll}
            className={`${choiceButtonClassName} bg-black text-white hover:bg-neutral-900`}
            aria-label="Akceptuję i przechodzę dalej"
          >
            Akceptuję i przechodzę dalej
          </Button>
        </div>

        {isPreferencesOpen ? null : (
          <button
            type="button"
            onClick={handleManagePreferences}
            className="mt-4 text-left text-sm text-neutral-800 underline underline-offset-[3px] transition-colors hover:text-black"
            aria-label="Zarządzaj preferencjami"
          >
            Zarządzaj preferencjami
          </button>
        )}
      </section>
    </div>
  )
}

export default CookieConsentBanner
