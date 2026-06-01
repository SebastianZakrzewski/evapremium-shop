"use client"

import { useCallback, useMemo, useState } from "react"
import Image from "next/image"
import { Car, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfiguratorPreviewFrame } from "./ConfiguratorPreviewFrame"
import {
  PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES,
  type CarModelPreviewSlide,
} from "./carModelPreviewCarousel.types"

export type { CarModelPreviewSlide } from "./carModelPreviewCarousel.types"

type CarModelPreviewCarouselProps = {
  brand?: string
  model?: string
  carLabel?: string | null
  /** Główne zdjęcie (np. mat_product_images) — jak wcześniejszy hero */
  isCarComplete?: boolean
  mainImageUrl?: string | null
  fallbackMainImage: string
  /** Karuzela pod spodem — docelowo z bazy; placeholder gdy puste */
  galleryImages?: CarModelPreviewSlide[]
  onOpenMainPreview?: () => void
  onOpenGalleryPreview?: (slide: CarModelPreviewSlide, index: number) => void
  /** Desktop: ramka jak podgląd dynamiczny (aspect 4/5) */
  heroLayout?: "compact" | "preview-frame"
  mainImageFit?: "cover" | "contain"
  /** false = krok 1 bez karuzeli placeholderów pod hero */
  showGallery?: boolean
  className?: string
}

const resolveGallerySlides = (
  galleryImages?: CarModelPreviewSlide[]
): CarModelPreviewSlide[] => {
  if (galleryImages && galleryImages.length > 0) {
    return [...galleryImages].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    )
  }
  return PLACEHOLDER_CAR_MODEL_PREVIEW_SLIDES
}

export const CarModelPreviewCarousel = ({
  brand,
  model,
  carLabel,
  isCarComplete = false,
  mainImageUrl,
  fallbackMainImage,
  galleryImages,
  onOpenMainPreview,
  onOpenGalleryPreview,
  heroLayout = "compact",
  mainImageFit = "cover",
  showGallery = true,
  className = "",
}: CarModelPreviewCarouselProps) => {
  const gallerySlides = useMemo(
    () => resolveGallerySlides(galleryImages),
    [galleryImages]
  )
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

  const useMainFromDb = isCarComplete && !!mainImageUrl
  const heroImage = useMainFromDb ? mainImageUrl! : fallbackMainImage
  const mainImageClassName =
    mainImageFit === "contain" && !useMainFromDb
      ? "object-contain p-4 sm:p-6"
      : "object-cover"

  const defaultAlt =
    brand && model
      ? `Podgląd dywaników ${brand} ${model}`
      : "Podgląd dywaników EVA"

  const showCarBadge = !!carLabel
  const hasGalleryMultiple = gallerySlides.length > 1
  const usingGalleryPlaceholder = !galleryImages || galleryImages.length === 0

  const goToGallery = useCallback(
    (index: number) => {
      if (gallerySlides.length === 0) return
      const next =
        ((index % gallerySlides.length) + gallerySlides.length) %
        gallerySlides.length
      setActiveGalleryIndex(next)
    },
    [gallerySlides.length]
  )

  const heroAlt = showCarBadge ? `Dywaniki ${carLabel}` : defaultAlt

  const carBadgeOverlay = showCarBadge ? (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-3 flex items-center gap-2 pointer-events-none">
      <Car className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden />
      <p className="text-sm font-medium text-white truncate text-left">{carLabel}</p>
    </div>
  ) : null

  return (
    <div className={`mb-5 space-y-3 ${className}`.trim()}>
      {heroLayout === "preview-frame" ? (
        <div className="space-y-2">
          <ConfiguratorPreviewFrame
            imageSrc={heroImage}
            alt={heroAlt}
            imageFit={mainImageFit}
            priority
            onOpen={onOpenMainPreview}
            onZoomClick={() => onOpenMainPreview?.()}
            overlayFooter={carBadgeOverlay}
          />
          {!isCarComplete && (
            <p className="text-xs text-gray-400 text-center px-1">
              Uzupełnij dane auta, aby zobaczyć zdjęcie pod Twój model
            </p>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <button
            type="button"
            onClick={onOpenMainPreview}
            className="relative w-full aspect-[4/3] max-h-[220px] block group active:scale-[0.99] transition-transform"
            aria-label="Powiększ główne zdjęcie produktu"
          >
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              className={`${mainImageClassName} transition-transform duration-300 group-active:scale-105`}
              sizes="(max-width: 1024px) 100vw, 400px"
              priority
            />
            {carBadgeOverlay}
            <div className="absolute top-2 right-2">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full bg-black/70 backdrop-blur border border-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenMainPreview?.()
                }}
                aria-label="Powiększ"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </button>
          {!isCarComplete && (
            <p className="text-xs text-gray-400 px-3 py-2 border-t border-white/10 text-center">
              Uzupełnij dane auta, aby zobaczyć zdjęcie pod Twój model
            </p>
          )}
        </div>
      )}

      {showGallery && (
      <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Zdjęcia podglądowe
          </p>
          {usingGalleryPlaceholder && (
            <span className="text-[10px] text-gray-500">placeholder</span>
          )}
        </div>

        <div className="relative px-2 pb-3">
          {hasGalleryMultiple && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/10 text-white"
                onClick={() => goToGallery(activeGalleryIndex - 1)}
                aria-label="Poprzednie zdjęcie w galerii"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/80 border border-white/10 text-white"
                onClick={() => goToGallery(activeGalleryIndex + 1)}
                aria-label="Następne zdjęcie w galerii"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          <div
            className={`flex gap-2 overflow-x-auto scrollbar-hide py-1 ${
              hasGalleryMultiple ? "px-8" : "px-1"
            }`}
            role="list"
            aria-label="Galeria zdjęć podglądowych"
          >
            {gallerySlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="listitem"
                onClick={() => {
                  goToGallery(index)
                  onOpenGalleryPreview?.(slide, index)
                }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all active:scale-95 ${
                  index === activeGalleryIndex
                    ? "border-red-500 ring-1 ring-red-500/40 scale-105"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
                aria-label={`Podgląd ${index + 1} z ${gallerySlides.length}`}
                aria-current={index === activeGalleryIndex}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.altText ?? `Podgląd ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {hasGalleryMultiple && (
            <div
              className="flex justify-center gap-1.5 pt-2"
              role="tablist"
              aria-label="Indykator galerii"
            >
              {gallerySlides.map((slide, index) => (
                <button
                  key={`gallery-dot-${slide.id}`}
                  type="button"
                  role="tab"
                  aria-selected={index === activeGalleryIndex}
                  aria-label={`Slajd ${index + 1}`}
                  onClick={() => goToGallery(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeGalleryIndex
                      ? "w-5 bg-red-500"
                      : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
