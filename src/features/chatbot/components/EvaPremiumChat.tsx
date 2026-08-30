'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams, usePathname } from 'next/navigation'
import { pageTypeFromPath, productIdFromShopParams } from '../lib/pageContext'

const ChatWindow = dynamic(
  () => import('@/widget').then((mod) => mod.ChatWindow),
  {
    ssr: false,
    loading: () => null,
  },
)

const agentsApiBase = (process.env.NEXT_PUBLIC_EVA_AGENTS_URL ?? 'http://localhost:4111').replace(
  /\/$/,
  '',
)

export const EvaPremiumChat = () => {
  const pathname = usePathname()
  const params = useParams()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const shouldHideChat = isMobile && pathname.startsWith('/konfigurator')
  if (shouldHideChat) {
    return null
  }

  return (
    <ChatWindow
      apiBase={agentsApiBase}
      title="EvaBot"
      subtitle="Konsultant EVA Premium"
      avatarSrc="/evabot.jpg"
      getPageContext={() => {
        const pageType = pageTypeFromPath(pathname)
        const productId =
          pageType === 'product'
            ? productIdFromShopParams(
                pathname,
                params,
                new URLSearchParams(window.location.search),
              )
            : undefined

        return {
          url: window.location.href,
          locale: document.documentElement.lang || undefined,
          pageType,
          ...(productId ? { productId } : {}),
        }
      }}
    />
  )
}
