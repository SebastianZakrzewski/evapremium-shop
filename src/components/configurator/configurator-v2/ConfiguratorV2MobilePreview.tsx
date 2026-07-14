"use client"

import { ZoomIn } from "lucide-react"
import { MOBILE_STICKY_PREVIEW } from "@/components/configurator/configurator-simple/stickyPreview"
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
}: ConfiguratorV2MobilePreviewProps) => (
  <button
    type="button"
    onClick={onOpenZoom}
    className={`relative block w-full ${MOBILE_STICKY_PREVIEW.imageHeightClass} bg-[#0a0a0a] overflow-hidden`}
    aria-label="Powiększ podgląd"
  >
    <ConfiguratorV2CrossfadeImage
      imageSrc={imageSrc}
      alt={alt}
      priority
    />
    <span className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 text-[11px] text-white/90 bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15">
      <ZoomIn className="w-3.5 h-3.5" aria-hidden />
      Powiększ
    </span>
  </button>
)
