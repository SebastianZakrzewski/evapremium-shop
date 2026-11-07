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
          className={`h-11 w-11 overflow-hidden rounded-full border-2 transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 ${
            isSelected
              ? "border-neutral-950"
              : "border-neutral-300 hover:border-neutral-500"
          }`}
          style={
            !item.imageSrc && item.color
              ? { backgroundColor: item.color }
              : undefined
          }
        >
          {item.imageSrc && (
            <Image
              src={item.imageSrc.replace(/\.(png|jpe?g|webp)$/i, ".webp").replace(
                /(\/kolor-materialu\/|\/kolor-obszycia\/|\/struktura-komorek\/)/,
                "$1display/",
              )}
              alt=""
              aria-hidden
              width={MATERIAL_COLOR_SWATCH_SIZE}
              height={MATERIAL_COLOR_SWATCH_SIZE}
              quality={75}
              sizes="44px"
              loading="lazy"
              className="h-full w-full object-cover"
              draggable={false}
            />
          )}
        </button>
      )
    })}
  </div>
)
