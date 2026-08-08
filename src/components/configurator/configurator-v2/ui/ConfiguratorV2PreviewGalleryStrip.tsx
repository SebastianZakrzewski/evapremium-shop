"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageIcon, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CONFIGURATOR_V2_MOBILE_GALLERY_STRIP_HEIGHT,
} from "../configuratorV2MobileLayout"
import type { PreviewGalleryItem } from "../preview/buildConfiguratorV2PreviewGallery"

const EMPTY_IN_CAR_SLOT_COUNT = 3

type ConfiguratorV2PreviewGalleryStripProps = {
  items: PreviewGalleryItem[]
  activeId: string | null
  onSelect: (id: string) => void
  variant?: "panel" | "mobile"
  showEmptyInCarSlot?: boolean
}

export const ConfiguratorV2PreviewGalleryStrip = ({
  items,
  activeId,
  onSelect,
  variant = "panel",
  showEmptyInCarSlot = false,
}: ConfiguratorV2PreviewGalleryStripProps) => {
  if (items.length === 0 && !showEmptyInCarSlot) return null

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  )

  const handlePrevious = () => {
    const previousIndex =
      (activeIndex - 1 + items.length) % items.length
    const previousItem = items[previousIndex]
    if (previousItem) onSelect(previousItem.id)
  }

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % items.length
    const nextItem = items[nextIndex]
    if (nextItem) onSelect(nextItem.id)
  }

  const isMobile = variant === "mobile"
  const thumbClassName = isMobile ? "w-12 h-12" : "w-16 h-16 sm:w-20 sm:h-20"

  return (
    <div
      className={
        isMobile
          ? `shrink-0 border-t border-white/10 bg-black ${CONFIGURATOR_V2_MOBILE_GALLERY_STRIP_HEIGHT}`
          : "rounded-xl border border-white/10 bg-black/40 overflow-hidden shrink-0"
      }
    >
      {!isMobile && (
        <div className="px-3 pt-2.5 pb-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Zdjęcia podglądowe
          </p>
        </div>
      )}

      <div
        className={`relative flex h-full items-center ${
          isMobile ? "px-2" : "px-2 pb-3"
        }`}
      >
        {items.length > 1 && (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/80 border border-white/10 text-white ${
                isMobile ? "h-7 w-7" : "h-8 w-8"
              }`}
              onClick={handlePrevious}
              aria-label="Poprzednie zdjęcie w galerii"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/80 border border-white/10 text-white ${
                isMobile ? "h-7 w-7" : "h-8 w-8"
              }`}
              onClick={handleNext}
              aria-label="Następne zdjęcie w galerii"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        <div
          className={`flex gap-2 overflow-x-auto scrollbar-hide py-1 ${
            items.length > 1 ? "px-8" : "px-1"
          }`}
          role="list"
          aria-label="Galeria zdjęć podglądowych"
        >
          {items.map((item, index) => {
            const isActive = item.id === activeId
            const thumbLabel =
              item.kind === "dynamic"
                ? "Konfiguracja"
                : item.kind === "model-template"
                  ? "Schemat modelu"
                  : `Podgląd ${index + 1}`

            return (
              <button
                key={item.id}
                type="button"
                role="listitem"
                onClick={() => onSelect(item.id)}
                className={`relative rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all active:scale-95 ${thumbClassName} ${
                  isActive
                    ? "border-red-500 ring-1 ring-red-500/40 scale-105"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
                aria-label={thumbLabel}
                aria-current={isActive}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.altText}
                  fill
                  className="object-cover"
                  sizes={isMobile ? "48px" : "80px"}
                />
                {item.kind === "dynamic" && (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-0.5 text-white">
                    <Layers className="h-3 w-3" aria-hidden />
                  </span>
                )}
                {item.kind === "model-template" && (
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-black/80 px-1 text-[9px] font-medium uppercase tracking-wide text-white">
                    Model
                  </span>
                )}
              </button>
            )
          })}

          {showEmptyInCarSlot && (
            <div
              className="flex items-center gap-2 flex-shrink-0"
              role="group"
              aria-label="Zdjęcia w aucie — wkrótce"
            >
              {Array.from({ length: EMPTY_IN_CAR_SLOT_COUNT }).map((_, index) => (
                <div
                  key={`empty-in-car-${index}`}
                  className={`relative rounded-lg border border-dashed border-white/15 bg-white/5 flex-shrink-0 ${thumbClassName}`}
                  aria-hidden
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/25">
                    <ImageIcon className="h-4 w-4" aria-hidden />
                    {index === 0 && !isMobile && (
                      <span className="text-[8px] uppercase tracking-wide leading-none">
                        W aucie
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
