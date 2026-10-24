"use client"

import { Maximize2 } from "lucide-react"
import type { MouseEvent } from "react"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { useHorizontalSwipe } from "./hooks/useHorizontalSwipe"

type ConfiguratorV2PreviewPanelProps = {
  imageSrc: string
  alt: string
  usesMatPreviewCanvas?: boolean
  onOpenZoom?: () => void
  onSwipePrevious?: () => void
  onSwipeNext?: () => void
  canSwipeGallery?: boolean
  fitToWindowWidth?: boolean
}

export const ConfiguratorV2PreviewPanel = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
  onSwipePrevious,
  onSwipeNext,
  canSwipeGallery = false,
  fitToWindowWidth = false,
}: ConfiguratorV2PreviewPanelProps) => {
  const isInteractive = !!onOpenZoom
  const canvasClass = fitToWindowWidth
    ? "bg-white"
    : usesMatPreviewCanvas
      ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
      : getMatPreviewCanvasClass(imageSrc)

  const swipeHandlers = useHorizontalSwipe({
    enabled: canSwipeGallery,
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrevious,
  })

  const handleOpenZoom = () => {
    if (swipeHandlers.consumeSuppressedClick()) return
    onOpenZoom?.()
  }

  const handleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    handleOpenZoom()
  }

  return (
    <div
      className={`relative group h-full w-full min-h-0 flex flex-col overflow-hidden rounded-2xl bg-[#111] ${
        canSwipeGallery
          ? "cursor-grab active:cursor-grabbing"
          : isInteractive
            ? "cursor-pointer"
            : ""
      }`}
      onClick={handleOpenZoom}
      onPointerDown={swipeHandlers.onPointerDown}
      onPointerMove={swipeHandlers.onPointerMove}
      onPointerUp={swipeHandlers.onPointerUp}
      onPointerCancel={swipeHandlers.onPointerCancel}
      style={swipeHandlers.dragStyle}
    >
      <div className={`relative flex-1 min-h-0 w-full h-full overflow-hidden ${canvasClass}`}>
        <ConfiguratorV2CrossfadeImage
          imageSrc={imageSrc}
          alt={alt}
          canvasClassName={canvasClass}
          fitToWindowWidth={fitToWindowWidth}
          priority
        />

        {isInteractive && (
          <button
            type="button"
            onClick={handleZoom}
            aria-label="Powiększ podgląd"
            className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            Powiększ
          </button>
        )}
      </div>
    </div>
  )
}
