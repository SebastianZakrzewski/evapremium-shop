"use client"

import Image from "next/image"
import { ChevronDown, ChevronUp, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  MOBILE_STICKY_PREVIEW,
  type StickyPreviewTab,
} from "./stickyPreview"

type MobileStickyPreviewProps = {
  previewImage: string
  activeTab: StickyPreviewTab
  onTabChange: (tab: StickyPreviewTab) => void
  onOpenModal: (type: StickyPreviewTab) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  showDynamicTab: boolean
  showProductTab: boolean
  showMatProductTab: boolean
  dynamicThumbnail: string
  matProductImage: string | null
  productGalleryImages: string[]
  selectedProductImage: string
  onSelectProductImage: (path: string) => void
  showPreviewHint: boolean
  onDismissPreviewHint: () => void
  showBackToDynamicButton?: boolean
  onBackToDynamic?: () => void
}

export const MobileStickyPreview = ({
  previewImage,
  activeTab,
  onTabChange,
  onOpenModal,
  isCollapsed,
  onToggleCollapse,
  showDynamicTab,
  showProductTab,
  showMatProductTab,
  dynamicThumbnail,
  matProductImage,
  productGalleryImages,
  selectedProductImage,
  onSelectProductImage,
  showPreviewHint,
  onDismissPreviewHint,
  showBackToDynamicButton = false,
  onBackToDynamic,
}: MobileStickyPreviewProps) => {
  const handleMainClick = () => {
    onDismissPreviewHint()
    onOpenModal(activeTab)
  }

  const mainImageClassName =
    activeTab === "mat-product"
      ? "object-cover"
      : "object-contain p-2 sm:p-3"

  if (isCollapsed) {
    return (
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3 px-3 py-2">
          <button
            type="button"
            onClick={handleMainClick}
            className="relative w-12 h-12 rounded-lg overflow-hidden border border-red-500/40 flex-shrink-0 active:scale-95 transition-transform"
            aria-label="Otwórz podgląd produktu"
          >
            <Image src={previewImage} alt="" fill className="object-cover" sizes="48px" />
          </button>
          <span className="text-xs text-gray-300 flex-1 truncate">Podgląd produktu</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white h-8 px-2"
            onClick={onToggleCollapse}
            aria-label="Rozwiń podgląd"
          >
            <ChevronDown className="w-4 h-4 mr-1" />
            Rozwiń
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div
        className={`relative w-full ${MOBILE_STICKY_PREVIEW.imageHeightClass} group`}
      >
        <Image
          src={previewImage}
          alt="Podgląd produktu"
          fill
          className={`${mainImageClassName} transition-transform duration-300 group-active:scale-105`}
          priority
        />
        <button
          type="button"
          onClick={handleMainClick}
          className="absolute inset-0 w-full h-full"
          aria-label="Powiększ obraz"
        />
        {showPreviewHint && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-white" aria-hidden />
            <span className="text-xs text-white font-medium">Dotknij, aby powiększyć</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-black/70 backdrop-blur border border-white/20 text-white"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse()
            }}
            aria-label="Zwiń podgląd"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-red-600/90 backdrop-blur border border-red-500/50 text-white"
            onClick={(e) => {
              e.stopPropagation()
              handleMainClick()
            }}
            aria-label="Powiększ"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-2 bg-black/95 border-t border-white/10 space-y-2">
        {showBackToDynamicButton && activeTab !== "dynamic" && onBackToDynamic && (
          <Button
            type="button"
            variant="outline"
            onClick={onBackToDynamic}
            className="w-full min-h-[40px] border-white/20 bg-black/50 text-white text-xs hover:bg-red-600/20 hover:border-red-500/50"
          >
            Wróć do podglądu konfiguracji dywanika
          </Button>
        )}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {showDynamicTab && (
            <PreviewThumb
              image={dynamicThumbnail}
              isActive={activeTab === "dynamic"}
              label="Konfiguracja"
              onClick={() => {
                onTabChange("dynamic")
                onOpenModal("dynamic")
              }}
              objectCover
            />
          )}
          {showMatProductTab && matProductImage && (
            <PreviewThumb
              image={matProductImage}
              isActive={activeTab === "mat-product"}
              label="Twój model"
              onClick={() => {
                onTabChange("mat-product")
                onOpenModal("mat-product")
              }}
              objectCover
            />
          )}
          {showProductTab &&
            productGalleryImages.map((imagePath) => (
              <PreviewThumb
                key={imagePath}
                image={imagePath}
                isActive={activeTab === "product" && selectedProductImage === imagePath}
                onClick={() => {
                  onSelectProductImage(imagePath)
                  onTabChange("product")
                  onOpenModal("product")
                }}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

type PreviewThumbProps = {
  image: string
  isActive: boolean
  label?: string
  onClick: () => void
  objectCover?: boolean
}

const PreviewThumb = ({
  image,
  isActive,
  label,
  onClick,
  objectCover = false,
}: PreviewThumbProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation()
      onClick()
    }}
    className={`
      relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 active:scale-95
      ${isActive
        ? "border-red-500 shadow-lg shadow-red-500/20 scale-105 ring-1 ring-red-500/50"
        : "border-white/10 opacity-60 active:opacity-100"
      }
    `}
    aria-label={label ?? "Miniatura podglądu"}
    title={label}
  >
    <Image
      src={image}
      alt=""
      fill
      className={objectCover ? "object-cover" : "object-contain p-1"}
      sizes="48px"
    />
  </button>
)
