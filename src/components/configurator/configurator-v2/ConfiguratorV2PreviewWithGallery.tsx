"use client"

import { useCallback } from "react"
import { ConfiguratorV2MobilePreview } from "./ConfiguratorV2MobilePreview"
import { ConfiguratorV2PreviewPanel } from "./ConfiguratorV2PreviewPanel"
import { ConfiguratorV2PreviewGalleryStrip } from "./ui/ConfiguratorV2PreviewGalleryStrip"
import type { PreviewGalleryItem } from "./preview/buildConfiguratorV2PreviewGallery"
import { getAdjacentGalleryItemId } from "./preview/getAdjacentGalleryItemId"
import { isProductPhotoFramedToWindowWidth } from "./preview/productPhotoFrame"
import { useMobilePreviewDocked } from "./MobilePreviewDockContext"

type ConfiguratorV2PreviewWithGalleryProps = {
  imageSrc: string
  alt: string
  usesMatPreviewCanvas?: boolean
  onOpenZoom?: () => void
  showGallery: boolean
  showEmptyInCarSlot?: boolean
  galleryItems: PreviewGalleryItem[]
  activeGalleryId: string | null
  onSelectGalleryItem: (id: string) => void
  realizationCaption?: string | null
  layout: "desktop" | "mobile"
}

export const ConfiguratorV2PreviewWithGallery = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
  showGallery,
  showEmptyInCarSlot = false,
  galleryItems,
  activeGalleryId,
  onSelectGalleryItem,
  realizationCaption = null,
  layout,
}: ConfiguratorV2PreviewWithGalleryProps) => {
  const previewDocked = useMobilePreviewDocked()
  const caption = realizationCaption?.trim() || null
  const canSwipeGallery = galleryItems.length > 1
  const activeGalleryKind = galleryItems.find(
    (item) => item.id === activeGalleryId,
  )?.kind
  const fitToWindowWidth = isProductPhotoFramedToWindowWidth(activeGalleryKind)

  const handleSwipePrevious = useCallback(() => {
    const previousId = getAdjacentGalleryItemId(
      galleryItems,
      activeGalleryId,
      "previous",
    )
    if (previousId) onSelectGalleryItem(previousId)
  }, [activeGalleryId, galleryItems, onSelectGalleryItem])

  const handleSwipeNext = useCallback(() => {
    const nextId = getAdjacentGalleryItemId(
      galleryItems,
      activeGalleryId,
      "next",
    )
    if (nextId) onSelectGalleryItem(nextId)
  }, [activeGalleryId, galleryItems, onSelectGalleryItem])

  if (layout === "mobile") {
    return (
      <div className="flex flex-col bg-black">
        <ConfiguratorV2MobilePreview
          imageSrc={imageSrc}
          alt={alt}
          usesMatPreviewCanvas={usesMatPreviewCanvas}
          onOpenZoom={onOpenZoom}
          onSwipePrevious={handleSwipePrevious}
          onSwipeNext={handleSwipeNext}
          canSwipeGallery={canSwipeGallery}
          fitToWindowWidth={fitToWindowWidth}
        />
        {caption && !previewDocked && (
          <p
            className="px-3 py-2 text-center text-[11px] leading-snug text-white/70"
            role="note"
            aria-live="polite"
          >
            {caption}
          </p>
        )}
        {showGallery && (
          <div className="mt-3">
            <ConfiguratorV2PreviewGalleryStrip
              items={galleryItems}
              activeId={activeGalleryId}
              onSelect={onSelectGalleryItem}
              variant="mobile"
              showEmptyInCarSlot={showEmptyInCarSlot}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <div className="min-h-0 flex-1">
        <ConfiguratorV2PreviewPanel
          imageSrc={imageSrc}
          alt={alt}
          usesMatPreviewCanvas={usesMatPreviewCanvas}
          onOpenZoom={onOpenZoom}
          onSwipePrevious={handleSwipePrevious}
          onSwipeNext={handleSwipeNext}
          canSwipeGallery={canSwipeGallery}
          fitToWindowWidth={fitToWindowWidth}
        />
      </div>
      {caption && (
        <p
          className="px-1 text-center text-xs leading-snug text-white/70"
          role="note"
          aria-live="polite"
        >
          {caption}
        </p>
      )}
      {showGallery && (
        <ConfiguratorV2PreviewGalleryStrip
          items={galleryItems}
          activeId={activeGalleryId}
          onSelect={onSelectGalleryItem}
          variant="panel"
          showEmptyInCarSlot={showEmptyInCarSlot}
        />
      )}
    </div>
  )
}
