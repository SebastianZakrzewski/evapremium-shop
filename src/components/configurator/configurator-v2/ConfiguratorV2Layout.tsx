"use client"

import type { ReactNode } from "react"

type ConfiguratorV2LayoutProps = {
  specsBar: ReactNode
  previewPanel: ReactNode
  optionPanel: ReactNode
  stickyBar: ReactNode
  mobilePreview?: ReactNode
  modals?: ReactNode
}

/**
 * Tesla-style layout:
 * - Desktop: lewy panel podglądu nieruchomy, prawy panel przewija się niezależnie
 * - Mobile: podgląd sticky pod paskiem metryk, treść scrolluje pod spodem
 */
export const ConfiguratorV2Layout = ({
  specsBar,
  previewPanel,
  optionPanel,
  stickyBar,
  mobilePreview,
  modals,
}: ConfiguratorV2LayoutProps) => (
  <div
    className="min-h-screen bg-black text-white flex flex-col
      lg:h-[calc(100dvh-6rem)] lg:max-h-[calc(100dvh-6rem)] lg:overflow-hidden"
  >
    <header
      className="shrink-0 z-30 border-b border-white/10 bg-black/95 backdrop-blur-md
        sticky top-16 md:top-20 lg:top-24 lg:static"
    >
      <div className="container mx-auto px-4 py-3">{specsBar}</div>
    </header>

    {mobilePreview}

    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      {/* Desktop: podgląd przyklejony — kolumna nie scrolluje */}
      <aside
        className="hidden lg:flex lg:w-[38%] xl:w-[40%] shrink-0 h-full min-h-0
          bg-black items-center justify-center p-5 xl:p-8 overflow-hidden"
        aria-label="Podgląd produktu"
      >
        <div className="w-full h-[92%] max-h-[92%] min-h-0">{previewPanel}</div>
      </aside>

      {/* Prawy panel — jedyny scroll na desktop */}
      <main
        className="flex-1 overflow-y-auto overscroll-contain
          px-4 py-4 lg:py-6 lg:px-6 xl:px-8 space-y-8 pb-28 lg:pb-6"
      >
        {optionPanel}
      </main>
    </div>

    {stickyBar}
    {modals}
  </div>
)
