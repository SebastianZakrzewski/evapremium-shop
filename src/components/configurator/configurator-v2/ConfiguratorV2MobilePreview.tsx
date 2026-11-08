"use client"

import type { KeyboardEvent } from "react"
import { Maximize2 } from "lucide-react"
import {
  CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE,
  CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT,
} from "./configuratorV2MobileLayout"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { MODEL_CARD_FRAME_SIZE, previewFrameStyle } from "./preview/fitPreviewFrame"
import {
  CONTAINED_PREVIEW_IMAGE_CLASS,
  FILLED_PREVIEW_IMAGE_CLASS,
} from "./preview/productPhotoFrame"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"
import {
  useImageNaturalSize,
  useMobilePreviewMaxHeight,
} from "./hooks/useFittedPreviewFrame"
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
  frameImageSrc?: string | null
  useModelCardFrame?: boolean
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
  frameImageSrc,
  useModelCardFrame = false,
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
  const maxHeightPx = useMobilePreviewMaxHeight()
  const frameSource = frameImageSrc || imageSrc
  const measuredSize = useImageNaturalSize(frameSource)
  const imageSize = useModelCardFrame ? MODEL_CARD_FRAME_SIZE : measuredSize
  const fittedStyle = previewFrameStyle(imageSize, "mobile", maxHeightPx)
  const showsWholePhoto =
    useModelCardFrame || Boolean(frameImageSrc && frameImageSrc !== imageSrc)

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
    <div className="w-full [container-type:inline-size]">
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenZoom}
      onKeyDown={handleKeyDown}
      onPointerDown={swipeHandlers.onPointerDown}
      onPointerMove={swipeHandlers.onPointerMove}
      onPointerUp={swipeHandlers.onPointerUp}
      onPointerCancel={swipeHandlers.onPointerCancel}
      data-preview-frame={fittedStyle ? "fitted" : "pending"}
      style={{ ...swipeHandlers.dragStyle, ...fittedStyle }}
      className={`relative mx-auto block overflow-hidden ${canvasClass} rounded-2xl ${
        fittedStyle ? "max-w-full" : `w-full ${CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT}`
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
          imageClassName={
            fittedStyle
              ? showsWholePhoto
                ? CONTAINED_PREVIEW_IMAGE_CLASS
                : FILLED_PREVIEW_IMAGE_CLASS
              : undefined
          }
          canvasClassName={canvasClass}
          priority
        />
      </div>
      <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        Powiększ
      </span>
    </div>
    </div>
  )
}
