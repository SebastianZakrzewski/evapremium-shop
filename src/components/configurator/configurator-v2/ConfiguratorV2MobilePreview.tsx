"use client"

import type { KeyboardEvent } from "react"
import { ZoomIn } from "lucide-react"
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
}

export const ConfiguratorV2MobilePreview = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
  onSwipePrevious,
  onSwipeNext,
  canSwipeGallery = false,
}: ConfiguratorV2MobilePreviewProps) => {
  const canvasClass = usesMatPreviewCanvas
    ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
    : getMatPreviewCanvasClass(imageSrc)
  const scaleClass =
    usesMatPreviewCanvas || imageSrc.startsWith("/dywaniki/")
    ? CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE
    : "scale-100"

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
      className={`relative block w-full ${CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT} ${canvasClass} overflow-hidden ${
        canSwipeGallery ? "touch-none cursor-grab active:cursor-grabbing" : "touch-pan-y"
      }`}
      aria-label="Powiększ podgląd"
    >
      <div
        className={`absolute inset-0 origin-center ${scaleClass}`}
      >
        <ConfiguratorV2CrossfadeImage
          imageSrc={imageSrc}
          alt={alt}
          canvasClassName={canvasClass}
          priority
        />
      </div>
      <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 text-[10px] text-white bg-black/65 backdrop-blur-sm px-2 py-0.5 rounded-full border border-black/10 pointer-events-none">
        <ZoomIn className="w-3 h-3" aria-hidden />
        Powiększ
      </span>
    </div>
  )
}
