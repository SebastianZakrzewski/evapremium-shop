"use client"

import { ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KeyboardEvent, MouseEvent } from "react"
import { ConfiguratorV2CrossfadeImage } from "./ui/ConfiguratorV2CrossfadeImage"
import { getMatPreviewCanvasClass } from "./matPreviewCanvas"

type ConfiguratorV2PreviewPanelProps = {
  imageSrc: string
  alt: string
  usesMatPreviewCanvas?: boolean
  onOpenZoom?: () => void
}

export const ConfiguratorV2PreviewPanel = ({
  imageSrc,
  alt,
  usesMatPreviewCanvas = false,
  onOpenZoom,
}: ConfiguratorV2PreviewPanelProps) => {
  const isInteractive = !!onOpenZoom
  const canvasClass = usesMatPreviewCanvas
    ? getMatPreviewCanvasClass("/dywaniki/preview.webp")
    : getMatPreviewCanvasClass(imageSrc)

  const handleShellKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onOpenZoom) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onOpenZoom()
    }
  }

  const handleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onOpenZoom?.()
  }

  return (
    <div
      className={`relative group h-full w-full min-h-0 flex flex-col bg-[#111] rounded-xl border border-white/10 overflow-hidden ${
        isInteractive ? "cursor-pointer" : ""
      }`}
      onClick={onOpenZoom}
      onKeyDown={handleShellKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? `Powiększ: ${alt}` : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

      <div className={`relative flex-1 min-h-0 w-full h-full overflow-hidden ${canvasClass}`}>
        <ConfiguratorV2CrossfadeImage
          imageSrc={imageSrc}
          alt={alt}
          canvasClassName={canvasClass}
          priority
        />

        {isInteractive && (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
              <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-white" aria-hidden />
                <span className="text-xs text-white font-medium">
                  Kliknij aby powiększyć
                </span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      </div>
    </div>
  )
}
