"use client"

import Image from "next/image"
import { ZoomIn } from "lucide-react"

type MobileSummaryPreviewProps = {
  carLabel: string
  matProductImage: string | null
  dynamicPreviewPath: string
  productPreviewPath: string | null
  hasFullPreview: boolean
  onOpenPreview: () => void
}

export const MobileSummaryPreview = ({
  carLabel,
  matProductImage,
  dynamicPreviewPath,
  productPreviewPath,
  hasFullPreview,
  onOpenPreview,
}: MobileSummaryPreviewProps) => {
  const mainImage =
    (hasFullPreview ? dynamicPreviewPath : null) ??
    matProductImage ??
    productPreviewPath ??
    dynamicPreviewPath

  return (
    <div className="lg:hidden mb-6 space-y-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Podgląd zamówienia</p>
      <button
        type="button"
        onClick={onOpenPreview}
        className="relative w-full aspect-square max-h-[280px] rounded-xl overflow-hidden border border-white/10 bg-white/5 active:scale-[0.99] transition-transform"
        aria-label="Powiększ podgląd konfiguracji"
      >
        <Image
          src={mainImage}
          alt={`Konfiguracja ${carLabel}`}
          fill
          className={matProductImage && mainImage === matProductImage ? "object-cover" : "object-contain p-4"}
          sizes="100vw"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-3">
          <p className="text-sm font-semibold text-white">{carLabel}</p>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-full p-2">
          <ZoomIn className="w-4 h-4 text-white" aria-hidden />
        </div>
      </button>

      {(matProductImage || productPreviewPath) && hasFullPreview && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <MiniThumb src={dynamicPreviewPath} alt="Konfiguracja" onClick={onOpenPreview} />
          {matProductImage && (
            <MiniThumb src={matProductImage} alt="Twój model" onClick={onOpenPreview} cover />
          )}
          {productPreviewPath && (
            <MiniThumb src={productPreviewPath} alt="Galeria" onClick={onOpenPreview} cover />
          )}
        </div>
      )}
    </div>
  )
}

const MiniThumb = ({
  src,
  alt,
  onClick,
  cover = false,
}: {
  src: string
  alt: string
  onClick: () => void
  cover?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0"
    aria-label={alt}
  >
    <Image src={src} alt="" fill className={cover ? "object-cover" : "object-contain p-1"} sizes="56px" />
  </button>
)
