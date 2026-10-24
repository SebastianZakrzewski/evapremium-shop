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
import { useMobilePreviewDocked } from "./MobilePreviewDockContext"

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
  const docked = useMobilePreviewDocked()
  const canvasClass = usesMatPreviewCanvas
    ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
    : getMatPreviewCanvasClass(imageSrc)
  const restingScaleClass =
    usesMatPreviewCanvas || imageSrc.startsWith("/dywaniki/")
      ? CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE
      : "scale-100"
  const scaleClass = docked ? "scale-110" : restingScaleClass

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
      className={`relative block w-full overflow-hidden transition-[height,border-radius] duration-300 ease-out ${canvasClass} ${
        docked
          ? "h-[38vh] min-h-[240px] max-h-[420px] rounded-none"
          : `${CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT} rounded-2xl`
      } ${
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
      <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 text-[11px] text-white backdrop-blur">
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        Powiększ
      </span>
    </div>
  )
}
