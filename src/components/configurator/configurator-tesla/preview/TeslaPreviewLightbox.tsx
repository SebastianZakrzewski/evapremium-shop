"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { TESLA_LAYOUT } from "../tokens"

type TeslaPreviewLightboxProps = {
  open: boolean
  src: string
  alt: string
  onClose: () => void
}

export const TeslaPreviewLightbox = ({
  open,
  src,
  alt,
  onClose,
}: TeslaPreviewLightboxProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, open])

  if (!mounted || !open || !src) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Powiększony podgląd: ${alt}`}
      className="fixed inset-0 z-[200] flex flex-col bg-white"
      onClick={onClose}
    >
      <div
        className="flex justify-end px-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          aria-label="Zamknij podgląd"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center text-3xl leading-none"
          style={{ color: TESLA_LAYOUT.text }}
        >
          ×
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          quality={90}
          className="object-contain"
        />
      </div>
      <p
        className="px-4 text-center"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          fontSize: TESLA_LAYOUT.captionSize,
          lineHeight: `${TESLA_LAYOUT.captionLine}px`,
          color: TESLA_LAYOUT.muted,
        }}
      >
        Dotknij, aby zamknąć
      </p>
    </div>,
    document.body,
  )
}
