"use client"

import { ZoomIn } from "lucide-react"
import {
  CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE,
  CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT,
} from "./configuratorV2MobileLayout"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"

type ConfiguratorV2MobilePreviewProps = {
  imageSrc: string
  alt: string
  usesMatPreviewCanvas?: boolean
  onOpenZoom?: () => void
}

export const ConfiguratorV2MobilePreview = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
}: ConfiguratorV2MobilePreviewProps) => {
  const canvasClass = usesMatPreviewCanvas
    ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
    : getMatPreviewCanvasClass(imageSrc)
  const scaleClass =
    usesMatPreviewCanvas || imageSrc.startsWith("/dywaniki/")
    ? CONFIGURATOR_V2_MOBILE_MAT_IMAGE_SCALE
    : "scale-100"

  return (
    <button
      type="button"
      onClick={onOpenZoom}
      className={`relative block w-full ${CONFIGURATOR_V2_MOBILE_PREVIEW_HEIGHT} ${canvasClass} overflow-hidden`}
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
      <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 text-[10px] text-white bg-black/65 backdrop-blur-sm px-2 py-0.5 rounded-full border border-black/10">
        <ZoomIn className="w-3 h-3" aria-hidden />
        Powiększ
      </span>
    </button>
  )
}
