"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { MobilePreviewDockProvider } from "./MobilePreviewDockContext"
import { resolveMobilePreviewDocked } from "./mobilePreviewDock"

type ConfiguratorV2LayoutProps = {
  topBar: ReactNode
  specsBar: ReactNode
  introCard?: ReactNode
  previewPanel: ReactNode
  optionPanel: ReactNode
  stickyBarMobile: ReactNode
  mobilePreview?: ReactNode
  hideMobileStickyBar?: boolean
  modals?: ReactNode
}

/**
 * Desktop: pasek u góry, przyklejona scena po lewej, opcje po prawej.
 * Mobile: scena przyklejona u góry, opcje scrollują się pod nią, pasek na dole.
 */
export const ConfiguratorV2Layout = ({
  topBar,
  specsBar,
  introCard,
  previewPanel,
  optionPanel,
  stickyBarMobile,
  mobilePreview,
  hideMobileStickyBar = false,
  modals,
}: ConfiguratorV2LayoutProps) => {
  const optionsRef = useRef<HTMLElement>(null)
  const [previewDocked, setPreviewDocked] = useState(false)

  useEffect(() => {
    const options = optionsRef.current
    if (!options) return

    const handleScroll = () => {
      setPreviewDocked((docked) =>
        resolveMobilePreviewDocked(options.scrollTop, docked),
      )
    }

    options.addEventListener("scroll", handleScroll, { passive: true })
    return () => options.removeEventListener("scroll", handleScroll)
  }, [])

  return (
  <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black text-white">
    <div className="hidden shrink-0 border-b border-white/[0.08] bg-black lg:block">
      {topBar}
    </div>

    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {mobilePreview && (
        <MobilePreviewDockProvider docked={previewDocked}>
          <div
            className="shrink-0 border-b border-white/[0.08] bg-black px-4 pb-3 pt-3 lg:hidden"
            aria-label="Podgląd produktu"
          >
            {mobilePreview}
          </div>
        </MobilePreviewDockProvider>
      )}

      <aside
        className="hidden min-h-0 shrink-0 flex-col p-4 xl:p-6 lg:flex lg:w-[62%]"
        aria-label="Podgląd produktu"
      >
        <div className="min-h-0 flex-1">{previewPanel}</div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col bg-black">
        <main
          ref={optionsRef}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 lg:px-6 lg:py-6 lg:pb-8 xl:px-8"
        >
          <div className="order-1">{specsBar}</div>
          {introCard && <div className="order-2 mb-4">{introCard}</div>}
          <div className="order-3">{optionPanel}</div>
        </main>
      </div>
    </div>

    <div
      className={`shrink-0 pb-safe lg:hidden ${hideMobileStickyBar ? "hidden" : ""}`}
    >
      {stickyBarMobile}
    </div>

    {modals}
  </div>
  )
}
