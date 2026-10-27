"use client"

import type { KeyboardEvent } from "react"
import { Maximize2 } from "lucide-react"
import {
  CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE,
  CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT,
} from "./configuratorV2MobileLayout"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"
import { useHorizontalSwipe } from "./hooks/useHorizontalSwipe"

type ConfiguratorV2MobilePreviewProps = {
  imageSrc: string
  alt: string
  usesMatPreviewCanvas?: boolean
  onOpenZoom?: () => void
  onSwipePrevious?: () => void
  onSwipeNext?: () => void
  canSwipeGallery?: boolean
  fitToWindowWidth?: boolean
}

export const ConfiguratorV2MobilePreview = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
  onSwipePrevious,
  onSwipeNext,
  canSwipeGallery = false,
  fitToWindowWidth = false,
}: ConfiguratorV2MobilePreviewProps) => {
  const canvasClass = fitToWindowWidth
    ? "bg-white"
    : usesMatPreviewCanvas
      ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
      : getMatPreviewCanvasClass(imageSrc)
  const restingScaleClass =
    usesMatPreviewCanvas || imageSrc.startsWith("/dywaniki/")
      ? CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE
      : "scale-100"
  const scaleClass = fitToWindowWidth ? "scale-100" : restingScaleClass

  const swipeHandlers = useHorizontalSwipe({
    enabled: canSwipeGallery,
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrevious,
  })

  const handleOpenZoom = () => {
    if (swipeHandlers.consumeSuppressedClick()) return
    onOpenZoom?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    handleOpenZoom()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenZoom}
      onKeyDown={handleKeyDown}
      onPointerDown={swipeHandlers.onPointerDown}
      onPointerMove={swipeHandlers.onPointerMove}
      onPointerUp={swipeHandlers.onPointerUp}
      onPointerCancel={swipeHandlers.onPointerCancel}
      style={swipeHandlers.dragStyle}
      className={`relative block w-full overflow-hidden ${canvasClass} ${CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT} rounded-2xl ${
        canSwipeGallery ? "touch-none cursor-grab active:cursor-grabbing" : "touch-pan-y"
      }`}
      aria-label={`Powiększ: ${alt}`}
    >
      <div
        className={`absolute inset-0 origin-center transition-transform duration-300 ease-out ${scaleClass}`}
      >
        <ConfiguratorV2CrossfadeImage
          imageSrc={imageSrc}
          alt={alt}
          canvasClassName={canvasClass}
          priority
        />
      </div>
      <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        Powiększ
      </span>
    </div>
  )
}
