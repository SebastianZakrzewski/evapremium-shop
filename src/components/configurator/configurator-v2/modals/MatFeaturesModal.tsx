"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

const features = [
  {
    title: "Dokładne dopasowanie",
    description:
      "Każdy komplet wycinany na podstawie szablonu konkretnego modelu i nadwozia.",
  },
  {
    title: "Materiał EVA",
    description:
      "Lekka, elastyczna pianka — łatwa do czyszczenia, odporna na wilgoć i zapachy.",
  },
  {
    title: "Struktura komórek",
    description:
      "Romby lub plaster miodu — trzyma brud w komórkach, chroniąc wykładzinę auta.",
  },
  {
    title: "Personalizacja kolorów",
    description:
      "Szeroka paleta kolorów materiału i obszycia dopasowana do wnętrza Twojego auta.",
  },
]

type MatFeaturesModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const MatFeaturesModal = ({
  isOpen,
  onClose,
}: MatFeaturesModalProps) => {
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
      aria-labelledby="mat-features-title"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="mat-features-title" className="text-xl font-bold text-white">
            Funkcje dywaników EVA
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

        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature.title} className="border-b border-white/5 pb-4 last:border-0">
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
