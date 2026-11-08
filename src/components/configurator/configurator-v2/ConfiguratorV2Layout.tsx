"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { MobilePreviewDockProvider } from "./MobilePreviewDockContext"
import { resolveMobilePreviewDocked } from "./mobilePreviewDock"

const configuratorWindowClassName =
  "rounded-2xl border border-neutral-300 bg-[#FDFDFD] text-neutral-950 shadow-sm"

type ConfiguratorV2LayoutProps = {
  topBar: ReactNode
  stageNav?: ReactNode
  specsBar: ReactNode
  introCard?: ReactNode
  previewPanel: ReactNode
  optionPanel: ReactNode
  stickyBarMobile: ReactNode
  mobilePreview?: ReactNode
  hideMobileStickyBar?: boolean
  /** Na telefonie podsumowanie zajmuje ekran, bez podglądu. Na desktopie zostaje w karcie. */
  fullScreen?: boolean
  modals?: ReactNode
}

/**
 * Desktop: pasek u góry, przyklejona scena po lewej, opcje po prawej.
 * Mobile: scena przyklejona u góry, opcje scrollują się pod nią, pasek na dole.
 */
export const ConfiguratorV2Layout = ({
  topBar,
  stageNav,
  specsBar,
  introCard,
  previewPanel,
  optionPanel,
  stickyBarMobile,
  mobilePreview,
  hideMobileStickyBar = false,
  fullScreen = false,
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
  <div className="flex h-full min-h-0 flex-col overflow-hidden overflow-x-hidden bg-black text-white">
    <div className="hidden shrink-0 border-b border-white/[0.08] bg-black lg:block">
      {topBar}
    </div>

    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {!fullScreen && mobilePreview && (
        <MobilePreviewDockProvider docked={previewDocked}>
          <div
            className="shrink-0 border-b border-white/[0.08] bg-black px-4 pb-2 pt-2 lg:hidden"
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#E6E6E6] text-neutral-950">
        {stageNav && (
          <div className="relative z-20 shrink-0 overflow-hidden px-3 pt-1.5 lg:px-4 lg:pt-3">
            <div className={`${configuratorWindowClassName} p-1`}>
              {stageNav}
            </div>
          </div>
        )}
        <main
          ref={optionsRef}
          data-configurator-options
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-[#E6E6E6] px-3 pb-3 pt-2 text-neutral-950 lg:px-4 lg:py-4"
        >
          <div
            data-configurator-panel
            data-content-layout={fullScreen ? "full" : "split"}
            className={`${configuratorWindowClassName} flex min-w-0 flex-col px-3 py-2 sm:p-4 ${
              fullScreen ? "max-lg:min-h-full" : ""
            }`}
          >
            <div className="order-1">{specsBar}</div>
            {introCard && <div className="order-2 mb-4 hidden lg:block">{introCard}</div>}
            <div
              className={`order-3 min-w-0 ${
                fullScreen ? "max-lg:flex max-lg:flex-1 max-lg:flex-col" : ""
              }`}
            >
              {optionPanel}
            </div>
          </div>
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
