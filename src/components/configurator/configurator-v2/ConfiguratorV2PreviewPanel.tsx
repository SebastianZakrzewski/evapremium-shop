"use client"

import { Maximize2 } from "lucide-react"
import type { MouseEvent } from "react"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { MODEL_CARD_FRAME_SIZE, previewFrameStyle } from "./preview/fitPreviewFrame"
import {
  CONTAINED_PREVIEW_IMAGE_CLASS,
  FILLED_PREVIEW_IMAGE_CLASS,
} from "./preview/productPhotoFrame"
import { useImageNaturalSize } from "./hooks/useFittedPreviewFrame"
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
  frameImageSrc?: string | null
  useModelCardFrame?: boolean
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
  frameImageSrc,
  useModelCardFrame = false,
}: ConfiguratorV2PreviewPanelProps) => {
  const isInteractive = !!onOpenZoom
  const canvasClass = fitToWindowWidth
    ? "bg-white"
    : usesMatPreviewCanvas
      ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
      : getMatPreviewCanvasClass(imageSrc)

  const measuredSize = useImageNaturalSize(frameImageSrc || imageSrc)
  const imageSize = useModelCardFrame ? MODEL_CARD_FRAME_SIZE : measuredSize
  const fittedStyle = previewFrameStyle(imageSize, "desktop")
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

  const handleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    handleOpenZoom()
  }

  return (
    <div
      className={`relative group flex h-full w-full min-h-0 items-center justify-center [container-type:size] ${
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
      <div
        data-preview-frame={fittedStyle ? "fitted" : "pending"}
        className={`relative overflow-hidden rounded-2xl ${canvasClass} ${
          fittedStyle ? "" : "h-full w-full"
        }`}
        style={fittedStyle}
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
