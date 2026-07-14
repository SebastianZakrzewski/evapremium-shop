"use client"

import Image from "next/image"
import { ZoomIn } from "lucide-react"

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
  <div
    className="lg:hidden sticky z-20 bg-black/95 backdrop-blur-md border-b border-white/10
      top-[calc(4rem+3.25rem)] md:top-[calc(5rem+3.25rem)] px-3 pt-2 pb-2"
  >
    <button
      type="button"
      onClick={onOpenZoom}
      className="relative w-full h-36 sm:h-40 flex items-stretch justify-center bg-[#111] rounded-xl border border-white/10 overflow-hidden"
      aria-label="Powiększ podgląd"
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-contain w-full h-full"
        sizes="100vw"
        priority
      />
      <span className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-gray-300 bg-black/60 px-2 py-1 rounded-full">
        <ZoomIn className="w-3 h-3" />
        Powiększ
      </span>
    </button>
  </div>
)
