"use client"

import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KeyboardEvent, MouseEvent, ReactNode } from "react"

export type ConfiguratorPreviewFrameProps = {
  imageSrc: string
  alt: string
  imageFit?: "cover" | "contain"
  imageKey?: string
  priority?: boolean
  onOpen?: () => void
  onZoomClick?: (e: MouseEvent<HTMLButtonElement>) => void
  overlayFooter?: ReactNode
  className?: string
}

export const ConfiguratorPreviewFrame = ({
  imageSrc,
  alt,
  imageFit = "cover",
  imageKey,
  priority = false,
  onOpen,
  onZoomClick,
  overlayFooter,
  className = "",
}: ConfiguratorPreviewFrameProps) => {
  const isInteractive = !!onOpen

  const handleShellKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onOpen) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpen()
    }
  }

  const handleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (onZoomClick) {
      onZoomClick(e)
      return
    }
    onOpen?.()
  }

  const imageClassName =
    imageFit === "contain"
      ? "object-contain w-full h-full max-w-full max-h-full"
      : "object-cover transition-transform duration-700 group-hover:scale-105"

  return (
    <div
      className={`relative group bg-[#111] rounded-2xl p-1 border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-red-900/10 ${
        isInteractive ? "cursor-pointer" : ""
      } ${className}`.trim()}
      onClick={onOpen}
      onKeyDown={handleShellKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Powiększ: ${alt}` : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />

      <div className="relative aspect-[4/5] bg-black/50 rounded-xl overflow-hidden">
        <Image
          key={imageKey}
          src={imageSrc}
          alt={alt}
          fill
          className={imageClassName}
          sizes="(max-width: 1024px) 100vw, 360px"
          priority={priority}
        />

        {isInteractive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-white" aria-hidden />
                <span className="text-xs text-white font-medium">
                  Kliknij aby powiększyć
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full bg-red-600/90 backdrop-blur border-2 border-red-500/50 hover:bg-red-500 text-white shadow-lg shadow-red-500/30"
                onClick={handleZoom}
                aria-label="Powiększ podgląd"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}

        {overlayFooter}
      </div>
    </div>
  )
}
