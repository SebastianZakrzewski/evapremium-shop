"use client"

import type { ReactNode } from "react"
import {
  CONFIGURATOR_V2_MOBILE_CONTENT_PT,
  CONFIGURATOR_V2_MOBILE_CONTENT_PT_WITH_GALLERY,
  CONFIGURATOR_V2_MOBILE_MAIN_PB,
} from "./configuratorV2MobileLayout"

type ConfiguratorV2LayoutProps = {
  specsBar: ReactNode
  previewPanel: ReactNode
  optionPanel: ReactNode
  stickyBarDesktop: ReactNode
  stickyBarMobile: ReactNode
  mobilePreview?: ReactNode
  mobilePreviewHasGallery?: boolean
  hideMobileStickyBar?: boolean
  modals?: ReactNode
}

/**
 * Mobile (Tesla): fixed hero pod navbar → scroll (metryki + opcje) → sticky CTA
 * Desktop: split-screen bez zmian
 */
export const ConfiguratorV2Layout = ({
  specsBar,
  previewPanel,
  optionPanel,
  stickyBarDesktop,
  stickyBarMobile,
  mobilePreview,
  mobilePreviewHasGallery = false,
  hideMobileStickyBar = false,
  modals,
}: ConfiguratorV2LayoutProps) => (
  <div
    className="h-[100dvh] max-h-[100dvh] min-h-0 bg-black text-white flex flex-col overflow-hidden
      lg:h-[calc(100dvh-6rem)] lg:max-h-[calc(100dvh-6rem)]"
  >
    {mobilePreview && (
      <div
        className="lg:hidden fixed top-16 md:top-20 left-0 right-0 z-30 border-b border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        {mobilePreview}
      </div>
    )}

    <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
      <aside
        className="hidden lg:flex lg:w-[38%] xl:w-[40%] shrink-0 h-full min-h-0
          bg-black items-center justify-center p-5 xl:p-8 overflow-hidden"
        aria-label="Podgląd produktu"
      >
        <div className="w-full h-[92%] max-h-[92%] min-h-0">{previewPanel}</div>
      </aside>

      <div className="flex flex-1 min-h-0 flex-col bg-black">
        <header className="hidden lg:block shrink-0 border-b border-white/10 px-6 xl:px-10 py-5">
          {specsBar}
        </header>

        <main
          className={`flex-1 overflow-y-auto overscroll-contain
            px-4 py-3 lg:px-6 xl:px-10 lg:py-6 ${CONFIGURATOR_V2_MOBILE_MAIN_PB} lg:pb-4
            ${
              mobilePreviewHasGallery
                ? CONFIGURATOR_V2_MOBILE_CONTENT_PT_WITH_GALLERY
                : CONFIGURATOR_V2_MOBILE_CONTENT_PT
            } lg:pt-6`}
        >
          <div className="lg:hidden mb-3 pb-3 border-b border-white/10">
            {specsBar}
          </div>
          {optionPanel}
        </main>

        <div className="hidden lg:block shrink-0 sticky bottom-0 z-20 border-t border-white/10 bg-black/95 backdrop-blur-md">
          {stickyBarDesktop}
        </div>
      </div>
    </div>

    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe ${
        hideMobileStickyBar ? "hidden" : ""
      }`}
    >
      {stickyBarMobile}
    </div>

    {modals}
  </div>
)
