"use client"

import Image from "next/image"
import { MATERIAL_COLOR_SWATCH_SIZE } from "../material-color/materialColorPresentation"

type TeslaSwatchItem = {
  id: string
  label: string
  color?: string
  imageSrc?: string
}

type TeslaSwatchRowProps = {
  items: TeslaSwatchItem[]
  selectedId: string
  onSelect: (id: string) => void
}

export const TeslaSwatchRow = ({
  items,
  selectedId,
  onSelect,
}: TeslaSwatchRowProps) => (
  <div className="flex flex-wrap gap-3">
    {items.map((item) => {
      const isSelected = selectedId === item.id
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          aria-label={item.label}
          aria-pressed={isSelected}
          title={item.label}
          className={`h-11 w-11 overflow-hidden rounded-full border-2 transition-all ${
            isSelected
              ? "border-red-500 ring-2 ring-red-500/40 scale-105"
              : "border-white/25 hover:border-white/50"
          }`}
          style={
            !item.imageSrc && item.color
              ? { backgroundColor: item.color }
              : undefined
          }
        >
          {item.imageSrc && (
            <Image
              src={item.imageSrc}
              alt=""
              aria-hidden
              width={MATERIAL_COLOR_SWATCH_SIZE}
              height={MATERIAL_COLOR_SWATCH_SIZE}
              quality={100}
              unoptimized
              sizes="44px"
              className="h-full w-full object-cover"
              draggable={false}
            />
          )}
        </button>
      )
    })}
  </div>
)
