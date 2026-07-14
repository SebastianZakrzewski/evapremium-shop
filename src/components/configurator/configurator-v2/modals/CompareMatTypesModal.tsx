"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

const matTypeComparison = [
  {
    id: "3d-with-rims",
    name: "3D z rantami",
    description:
      "Wysokie ranty chronią podłogę przed brudem, wodą i śniegiem. Idealne na polskie warunki pogodowe.",
    highlight: "Maksymalna ochrona",
  },
  {
    id: "classic",
    name: "3D bez rantów",
    description:
      "Smukły profil bez wysokich rantów. Zachowuje estetykę wnętrza przy pełnej funkcjonalności EVA.",
    highlight: "Minimalistyczny wygląd",
  },
]

type CompareMatTypesModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const CompareMatTypesModal = ({
  isOpen,
  onClose,
}: CompareMatTypesModalProps) => {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-mat-types-title"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="compare-mat-types-title" className="text-xl font-bold text-white">
            Porównaj typy dywaników
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

        <div className="grid gap-4 sm:grid-cols-2">
          {matTypeComparison.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-white/10 bg-white/5"
            >
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1">
                {item.highlight}
              </p>
              <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-gray-300">
            <span className="text-red-400 font-semibold">EVA vs gumowe: </span>
            Lekka pianka EVA, dokładne dopasowanie do modelu, łatwe czyszczenie wodą
            i brak intensywnego zapachu latem.
          </p>
        </div>
      </div>
    </div>
  )
}
