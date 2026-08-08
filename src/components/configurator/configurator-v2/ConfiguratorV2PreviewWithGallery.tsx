"use client"

import { ConfiguratorV2MobilePreview } from "./ConfiguratorV2MobilePreview"
import { ConfiguratorV2PreviewPanel } from "./ConfiguratorV2PreviewPanel"
import { ConfiguratorV2PreviewGalleryStrip } from "./ui/ConfiguratorV2PreviewGalleryStrip"
import type { PreviewGalleryItem } from "./preview/buildConfiguratorV2PreviewGallery"

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
  layout,
}: ConfiguratorV2PreviewWithGalleryProps) => {
  if (layout === "mobile") {
    return (
      <div className="flex flex-col bg-black">
        <ConfiguratorV2MobilePreview
          imageSrc={imageSrc}
          alt={alt}
          usesMatPreviewCanvas={usesMatPreviewCanvas}
          onOpenZoom={onOpenZoom}
        />
        {showGallery && (
          <ConfiguratorV2PreviewGalleryStrip
            items={galleryItems}
            activeId={activeGalleryId}
            onSelect={onSelectGalleryItem}
            variant="mobile"
            showEmptyInCarSlot={showEmptyInCarSlot}
          />
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
        />
      </div>
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
