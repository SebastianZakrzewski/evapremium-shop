'use client'

import { Suspense, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { CookieConsentBanner } from '@/features/cookie-consent'
import { readModelCardQuery, shouldPinShopChrome } from '@/features/brands/model/modelCardUrl'

const pageOffsetClassName = 'pt-16 md:pt-20 lg:pt-24 max-w-full overflow-x-hidden'

const ShopChromeContent = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pinnedCard = shouldPinShopChrome(pathname, readModelCardQuery(searchParams))

  if (pinnedCard) {
    return <div className="h-dvh overflow-hidden bg-black">{children}</div>
  }

  return (
    <>
      <CookieConsentBanner />
      <Navbar />
      <div className={pageOffsetClassName}>{children}</div>
      <Footer />
    </>
  )
}

export const ShopChrome = ({ children }: { children: ReactNode }) => (
  <Suspense
    fallback={
      <>
        <CookieConsentBanner />
        <Navbar />
        <div className={pageOffsetClassName}>{children}</div>
        <Footer />
      </>
    }
  >
    <ShopChromeContent>{children}</ShopChromeContent>
  </Suspense>
)
