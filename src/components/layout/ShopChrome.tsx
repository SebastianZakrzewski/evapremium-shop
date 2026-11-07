'use client'

import { Suspense, useEffect, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { CookieConsentBanner } from '@/features/cookie-consent'
import { readModelCardQuery, shouldPinShopChrome } from '@/features/brands/model/modelCardUrl'

const pageOffsetClassName = 'pt-16 md:pt-20 lg:pt-24 max-w-full overflow-x-hidden'
const configuratorFrameClassName =
  'box-border h-dvh overflow-hidden pt-16 md:pt-20 lg:pt-24 max-w-full'

const isConfiguratorPath = (pathname: string | null) =>
  pathname === '/konfigurator'

const pinnedCardElement = () => {
  const card = document.querySelector('[data-pinned-model-card]')
  return card instanceof HTMLElement ? card : null
}

const reportPinnedCardHeight = () => {
  const card = pinnedCardElement()
  if (!card) {
    return
  }

  const height = Math.ceil(card.getBoundingClientRect().height)
  document.documentElement.style.height = `${height}px`
  document.body.style.height = `${height}px`
  window.parent.postMessage({ source: 'eva-shop-card', type: 'eva.card-size', height }, '*')
}

const ShopChromeContent = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pinnedCard = shouldPinShopChrome(pathname, readModelCardQuery(searchParams))
  const configuratorRoute = isConfiguratorPath(pathname)

  useEffect(() => {
    if (!pinnedCard || window.parent === window) {
      return undefined
    }

    const html = document.documentElement
    const body = document.body
    const previousHtmlMin = html.style.minHeight
    const previousBodyMin = body.style.minHeight
    const previousHtmlHeight = html.style.height
    const previousBodyHeight = body.style.height
    const previousHtmlMargin = html.style.margin
    const previousBodyMargin = body.style.margin
    const previousHtmlBackground = html.style.background
    const previousBodyBackground = body.style.background
    html.style.margin = '0'
    body.style.margin = '0'
    html.style.minHeight = '0px'
    body.style.minHeight = '0px'
    html.style.height = 'auto'
    body.style.height = 'auto'
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.background = '#111'
    body.style.background = '#111'

    const observer = new ResizeObserver(reportPinnedCardHeight)
    const watchCard = () => {
      const card = pinnedCardElement()
      if (!card) {
        return
      }
      observer.observe(card)
      reportPinnedCardHeight()
    }

    watchCard()
    const mutations = new MutationObserver(watchCard)
    mutations.observe(body, { childList: true, subtree: true })
    window.addEventListener('load', reportPinnedCardHeight)

    return () => {
      observer.disconnect()
      mutations.disconnect()
      window.removeEventListener('load', reportPinnedCardHeight)
      html.style.minHeight = previousHtmlMin
      body.style.minHeight = previousBodyMin
      html.style.height = previousHtmlHeight
      body.style.height = previousBodyHeight
      html.style.margin = previousHtmlMargin
      body.style.margin = previousBodyMargin
      html.style.background = previousHtmlBackground
      body.style.background = previousBodyBackground
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [pinnedCard])

  if (pinnedCard) {
    return <div className="bg-[#111]">{children}</div>
  }

  return (
    <>
      <CookieConsentBanner />
      <Navbar />
      <div className={configuratorRoute ? configuratorFrameClassName : pageOffsetClassName}>
        {children}
      </div>
      {!configuratorRoute && <Footer />}
    </>
  )
}

export const ShopChrome = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const configuratorRoute = isConfiguratorPath(pathname)
  const frameClassName = configuratorRoute
    ? configuratorFrameClassName
    : pageOffsetClassName

  return (
    <Suspense
      fallback={
        <>
          <CookieConsentBanner />
          <Navbar />
          <div className={frameClassName}>{children}</div>
          {!configuratorRoute && <Footer />}
        </>
      }
    >
      <ShopChromeContent>{children}</ShopChromeContent>
    </Suspense>
  )
}
