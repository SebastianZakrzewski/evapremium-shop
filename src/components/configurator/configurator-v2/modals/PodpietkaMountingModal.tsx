"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import {
  PODPIETKA_MOUNTING_PRICE,
  type PodpietkaMounting,
} from "@/features/car-configurator/domain/podpietkaMounting"
import { formatPriceValue } from "@/lib/utils/formatPrice"

type PodpietkaMountingModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelect: (mounting: PodpietkaMounting) => void
  accessoryName?: string
}

const mountingOptions: Array<{
  id: PodpietkaMounting
  title: string
  description: string
  priceLabel: string
}> = [
  {
    id: "professional",
    title: "Montaż przez nas",
    description:
      "Podpiętka zostanie zamontowana przez nas przed wysyłką. Dodatkowy koszt montażu.",
    priceLabel: `+${formatPriceValue(PODPIETKA_MOUNTING_PRICE)} zł`,
  },
  {
    id: "self",
    title: "Montaż indywidualny",
    description:
      "Otrzymasz podpiętkę do samodzielnego montażu. Bez dodatkowych kosztów.",
    priceLabel: "0 zł",
  },
]

export const PodpietkaMountingModal = ({
  isOpen,
  onClose,
  onSelect,
  accessoryName,
}: PodpietkaMountingModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (mounting: PodpietkaMounting) => {
    onSelect(mounting)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="podpietka-mounting-title"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2
              id="podpietka-mounting-title"
              className="text-xl font-bold text-white"
            >
              Montaż podpiętki
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {accessoryName
                ? `Czy „${accessoryName}” ma być zamontowana przez nas?`
                : "Czy podpiętka ma być zamontowana przez nas?"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg shrink-0"
            aria-label="Zamknij"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-3">
          {mountingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleSelect(option.id)
                }
              }}
              tabIndex={0}
              aria-label={`${option.title}, ${option.priceLabel}`}
              className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">
                    {option.title}
                  </p>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <span className="text-sm font-bold text-white shrink-0 tabular-nums">
                  {option.priceLabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
