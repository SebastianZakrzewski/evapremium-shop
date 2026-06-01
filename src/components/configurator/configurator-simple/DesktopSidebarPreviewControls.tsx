"use client"

import Image from "next/image"
import { Layers, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { StickyPreviewTab } from "./stickyPreview"

type DesktopSidebarPreviewControlsProps = {
  activeTab: StickyPreviewTab
  dynamicThumbnail: string
  productImages: string[]
  selectedProductImage: string | null
  onSelectDynamic: () => void
  onSelectProduct: (imagePath: string) => void
  galleryTitle: string
}

export const DesktopSidebarPreviewControls = ({
  activeTab,
  dynamicThumbnail,
  productImages,
  selectedProductImage,
  onSelectDynamic,
  onSelectProduct,
  galleryTitle,
}: DesktopSidebarPreviewControlsProps) => {
  const isDynamicActive = activeTab === "dynamic"

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={onSelectDynamic}
        className={`w-full min-h-[44px] border-white/20 bg-black/40 text-white hover:bg-red-600/20 hover:border-red-500/50 hover:text-white ${
          isDynamicActive ? "border-red-500/60 ring-1 ring-red-500/30" : ""
        }`}
        aria-pressed={isDynamicActive}
      >
        <Layers className="w-4 h-4 mr-2 shrink-0" aria-hidden />
        Wróć do podglądu konfiguracji dywanika
      </Button>

      <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
        <RotateCcw className="w-3 h-3" aria-hidden />
        Wybierz podgląd
      </p>

      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        role="tablist"
        aria-label="Przełącznik podglądu"
      >
        <PreviewModeThumb
          imageSrc={dynamicThumbnail}
          label="Konfiguracja"
          isActive={isDynamicActive}
          onClick={onSelectDynamic}
          icon={<Layers className="w-3 h-3" aria-hidden />}
        />

        {productImages.map((imagePath) => (
          <PreviewModeThumb
            key={imagePath}
            imageSrc={imagePath}
            isActive={activeTab === "product" && selectedProductImage === imagePath}
            onClick={() => onSelectProduct(imagePath)}
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{galleryTitle}</p>
    </div>
  )
}

type PreviewModeThumbProps = {
  imageSrc: string
  label?: string
  isActive: boolean
  onClick: () => void
  icon?: ReactNode
}

const PreviewModeThumb = ({
  imageSrc,
  label,
  isActive,
  onClick,
  icon,
}: PreviewModeThumbProps) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    onClick={onClick}
    className={`relative flex flex-col items-center gap-1 flex-shrink-0 transition-all ${
      isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
    }`}
  >
    <span
      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 bg-black/60 ${
        isActive
          ? "border-red-500 shadow-lg shadow-red-500/20 scale-105"
          : "border-white/10 hover:border-white/25"
      }`}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-contain p-0.5"
        sizes="56px"
      />
      {icon && (
        <span className="absolute bottom-0.5 right-0.5 bg-black/80 rounded px-0.5 text-white">
          {icon}
        </span>
      )}
    </span>
    {label && (
      <span className="text-[10px] text-gray-400 max-w-[56px] truncate">{label}</span>
    )}
  </button>
)
