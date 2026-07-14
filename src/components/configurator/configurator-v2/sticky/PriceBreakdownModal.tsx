"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice"
import type { PriceBreakdown } from "./ConfiguratorV2StickyBar"

type PriceBreakdownModalProps = {
  isOpen: boolean
  onClose: () => void
  priceBreakdown: PriceBreakdown
  accessoryPrice?: number
  accessoryName?: string
}

export const PriceBreakdownModal = ({
  isOpen,
  onClose,
  priceBreakdown,
  accessoryPrice = 0,
  accessoryName,
}: PriceBreakdownModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const total = priceBreakdown.totalPrice + accessoryPrice

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-breakdown-title"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="price-breakdown-title" className="text-xl font-bold text-white">
            Rozbicie ceny
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-400">Cena bazowa</dt>
            <dd className="text-white">{formatPricePln(priceBreakdown.basePrice)}</dd>
          </div>
          {priceBreakdown.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-400">Rabat</dt>
              <dd className="text-green-400">
                -{formatPriceValue(priceBreakdown.discount)} zł
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-400">Dywaniki</dt>
            <dd className="text-white">{formatPricePln(priceBreakdown.totalPrice)}</dd>
          </div>
          {accessoryPrice > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-400">{accessoryName || "Akcesoria"}</dt>
              <dd className="text-white">{formatPricePln(accessoryPrice)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-white/10 font-semibold">
            <dt className="text-white">Razem</dt>
            <dd className="text-white text-lg">{formatPricePln(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
