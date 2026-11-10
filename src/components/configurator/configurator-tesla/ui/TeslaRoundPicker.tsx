"use client"

import Image from "next/image"
import { TESLA_LAYOUT } from "../tokens"

export type TeslaRoundOption = {
  id: string
  label: string
  color?: string
  imageSrc?: string
}

type TeslaRoundPickerProps = {
  selectedName: string
  priceLabel: string
  options: TeslaRoundOption[]
  selectedId: string
  disabled?: boolean
  onSelect: (id: string) => void
}

export const TeslaRoundPicker = ({
  selectedName,
  priceLabel,
  options,
  selectedId,
  disabled = false,
  onSelect,
}: TeslaRoundPickerProps) => (
  <div>
    <div className="mb-3 flex items-start justify-between gap-3">
      <span
        className="font-medium"
        style={{
          fontSize: TESLA_LAYOUT.bodySize,
          lineHeight: `${TESLA_LAYOUT.bodyLine}px`,
          color: TESLA_LAYOUT.text,
        }}
      >
        {selectedName}
      </span>
      <span
        style={{
          fontSize: TESLA_LAYOUT.bodySize,
          lineHeight: `${TESLA_LAYOUT.bodyLine}px`,
          color: TESLA_LAYOUT.text,
        }}
      >
        {priceLabel}
      </span>
    </div>
    <div
      className="flex flex-wrap"
      style={{ gap: TESLA_LAYOUT.swatchGap }}
      role="listbox"
      aria-label={selectedName}
    >
      {options.map((option) => {
        const selected = option.id === selectedId
        return (
          <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={option.label}
            title={option.label}
            disabled={disabled}
            onClick={() => onSelect(option.id)}
            className="overflow-hidden rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171a20] disabled:opacity-40"
            style={{
              width: TESLA_LAYOUT.swatchSize,
              height: TESLA_LAYOUT.swatchSize,
              border: selected
                ? `2px solid ${TESLA_LAYOUT.selectedBorder}`
                : `1px solid ${TESLA_LAYOUT.border}`,
              backgroundColor: option.color,
              padding: option.imageSrc ? 0 : undefined,
            }}
          >
            {option.imageSrc ? (
              <Image
                src={option.imageSrc}
                alt=""
                width={TESLA_LAYOUT.swatchSize}
                height={TESLA_LAYOUT.swatchSize}
                className="h-full w-full object-cover"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  </div>
)
