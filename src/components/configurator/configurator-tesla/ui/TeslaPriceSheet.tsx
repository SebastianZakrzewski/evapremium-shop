"use client"

import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice"
import { TESLA_LAYOUT } from "../tokens"

type TeslaPriceSheetProps = {
  open: boolean
  onClose: () => void
  basePrice: number
  discount: number
  matPrice: number
  accessoryName?: string
  accessoryPrice: number
  mountingFee: number
}

export const TeslaPriceSheet = ({
  open,
  onClose,
  basePrice,
  discount,
  matPrice,
  accessoryName,
  accessoryPrice,
  mountingFee,
}: TeslaPriceSheetProps) => {
  if (!open) return null
  const accessoryBase = Math.max(0, accessoryPrice - mountingFee)
  const total = matPrice + accessoryPrice

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        aria-label="Zamknij szczegóły ceny"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tesla-price-sheet-title"
        className="absolute inset-x-0 bottom-0 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          padding: `20px ${TESLA_LAYOUT.pagePaddingX}px calc(20px + env(safe-area-inset-bottom))`,
          color: TESLA_LAYOUT.text,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="tesla-price-sheet-title"
            className="font-medium"
            style={{ fontSize: 28, lineHeight: "34px" }}
          >
            Szczegóły ceny
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex h-10 w-10 items-center justify-center text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <p
          className="mb-4 font-medium"
          style={{
            fontSize: TESLA_LAYOUT.priceFontSize,
            lineHeight: `${TESLA_LAYOUT.priceLineHeight}px`,
          }}
        >
          {formatPricePln(total)}
        </p>
        <dl className="space-y-3" style={{ fontSize: TESLA_LAYOUT.bodySize, lineHeight: `${TESLA_LAYOUT.bodyLine}px` }}>
          <div className="flex justify-between gap-4">
            <dt>Zestaw</dt>
            <dd>{formatPricePln(basePrice)}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between gap-4">
              <dt>Rabat</dt>
              <dd>-{formatPriceValue(discount)} zł</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt>Dywaniki</dt>
            <dd>{formatPricePln(matPrice)}</dd>
          </div>
          {accessoryBase > 0 ? (
            <div className="flex justify-between gap-4">
              <dt>{accessoryName || "Dodatek"}</dt>
              <dd>{formatPricePln(accessoryBase)}</dd>
            </div>
          ) : null}
          {mountingFee > 0 ? (
            <div className="flex justify-between gap-4">
              <dt>Montaż podpiętki</dt>
              <dd>{formatPricePln(mountingFee)}</dd>
            </div>
          ) : null}
        </dl>
        <p
          className="mt-4"
          style={{
            fontSize: TESLA_LAYOUT.captionSize,
            lineHeight: `${TESLA_LAYOUT.captionLine}px`,
            color: TESLA_LAYOUT.muted,
          }}
        >
          Informacja o całkowitym koszcie (w tym koszcie dostawy) jest podawana przed
          ostatecznym potwierdzeniem zamówienia. Dostawa tylko na terenie Polski.
        </p>
      </div>
    </div>
  )
}
