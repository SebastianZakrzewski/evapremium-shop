"use client"

import { TESLA_LAYOUT } from "../tokens"

type TeslaTextCardProps = {
  selected: boolean
  title: string
  detail?: string
  priceLabel: string
  disabled?: boolean
  onSelect: () => void
}

export const TeslaTextCard = ({
  selected,
  title,
  detail,
  priceLabel,
  disabled = false,
  onSelect,
}: TeslaTextCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={disabled}
    aria-pressed={selected}
    className="flex w-full items-center justify-between gap-3 bg-white text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171a20] disabled:cursor-not-allowed disabled:opacity-50"
    style={{
      minHeight: TESLA_LAYOUT.buttonHeight + 16,
      padding: `${TESLA_LAYOUT.cardPaddingY}px ${TESLA_LAYOUT.cardPaddingX}px`,
      borderRadius: TESLA_LAYOUT.cardRadius,
      border: selected
        ? `2px solid ${TESLA_LAYOUT.selectedBorder}`
        : `1px solid ${TESLA_LAYOUT.border}`,
    }}
  >
    <span className="min-w-0">
      <span
        className="block font-medium"
        style={{
          fontSize: TESLA_LAYOUT.bodySize,
          lineHeight: `${TESLA_LAYOUT.bodyLine}px`,
          color: TESLA_LAYOUT.text,
        }}
      >
        {title}
      </span>
      {detail ? (
        <span
          className="mt-0.5 block"
          style={{
            fontSize: TESLA_LAYOUT.captionSize,
            lineHeight: `${TESLA_LAYOUT.captionLine}px`,
            color: TESLA_LAYOUT.muted,
          }}
        >
          {detail}
        </span>
      ) : null}
    </span>
    <span
      className="shrink-0 text-right font-medium"
      style={{
        fontSize: TESLA_LAYOUT.bodySize,
        lineHeight: `${TESLA_LAYOUT.bodyLine}px`,
        color: TESLA_LAYOUT.text,
      }}
    >
      {priceLabel}
    </span>
  </button>
)
