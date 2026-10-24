"use client"

import { useCallback, useEffect, useRef } from "react"
import type { KeyboardEvent } from "react"
import { useHorizontalDragScroll } from "../hooks/useHorizontalDragScroll"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImageIcon, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PreviewGalleryItem } from "../preview/buildConfiguratorV2PreviewGallery"
import { getAdjacentGalleryItemId } from "../preview/getAdjacentGalleryItemId"

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
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const {
    scrollRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = useHorizontalDragScroll({ onThumbnailTap: onSelect })

  const handleThumbKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, itemId: string) => {
      if (event.key !== "Enter" && event.key !== " ") return
      event.preventDefault()
      onSelect(itemId)
    },
    [onSelect],
  )

  const handlePrevious = useCallback(() => {
    const previousId = getAdjacentGalleryItemId(items, activeId, "previous")
    if (previousId) onSelect(previousId)
  }, [activeId, items, onSelect])

  const handleNext = useCallback(() => {
    const nextId = getAdjacentGalleryItemId(items, activeId, "next")
    if (nextId) onSelect(nextId)
  }, [activeId, items, onSelect])

  useEffect(() => {
    if (!activeId) return
    const activeElement = itemRefs.current.get(activeId)
    if (!activeElement?.scrollIntoView) return

    activeElement.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }, [activeId, items])

  if (items.length === 0 && !showEmptyInCarSlot) return null

  const isMobile = variant === "mobile"
  const thumbClassName = "h-[3.7rem] w-[6.15rem]"
  const hasMultipleItems = items.length > 1

  return (
    <div className="shrink-0">
      <div className="relative flex min-w-0 items-center">
        {hasMultipleItems && (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1c1c1e]/90 text-white ${
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
              className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#1c1c1e]/90 text-white ${
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
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className={`flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-hide py-1 snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none ${
            hasMultipleItems ? "px-8" : "px-1"
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
                data-gallery-thumb-id={item.id}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(item.id, element)
                    return
                  }
                  itemRefs.current.delete(item.id)
                }}
                type="button"
                role="listitem"
                onKeyDown={(event) => handleThumbKeyDown(event, item.id)}
                className={`relative flex-shrink-0 snap-center overflow-hidden rounded-xl ring-1 transition-shadow ${thumbClassName} ${
                  isActive
                    ? "ring-white"
                    : "ring-white/15 opacity-70 hover:opacity-100"
                }`}
                aria-label={thumbLabel}
                aria-current={isActive}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.altText}
                  fill
                  className="object-cover"
                  sizes="100px"
                  draggable={false}
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
              className="flex items-center gap-2 flex-shrink-0 snap-center"
              role="group"
              aria-label="Zdjęcia w aucie — wkrótce"
            >
              {Array.from({ length: EMPTY_IN_CAR_SLOT_COUNT }).map((_, index) => (
                <div
                  key={`empty-in-car-${index}`}
                  className={`relative flex-shrink-0 rounded-xl bg-[#1c1c1e] ring-1 ring-white/10 ${thumbClassName}`}
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
