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
  onOpenZoom?: () => void
}

export const ConfiguratorV2MobilePreview = ({
  imageSrc,
  alt,
  onOpenZoom,
}: ConfiguratorV2MobilePreviewProps) => {
  const canvasClass = getMatPreviewCanvasClass(imageSrc)
  const scaleClass = imageSrc.startsWith("/dywaniki/")
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
      <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 text-[11px] text-white bg-black/65 backdrop-blur-sm px-2.5 py-1 rounded-full border border-black/10">
        <ZoomIn className="w-3.5 h-3.5" aria-hidden />
        Powiększ
      </span>
    </button>
  )
}
