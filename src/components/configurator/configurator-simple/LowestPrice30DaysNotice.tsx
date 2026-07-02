"use client"

import React from "react"
import { formatPricePln } from "@/lib/utils/formatPrice"

type LowestPrice30DaysNoticeProps = {
  priceAfterDiscount?: number
  regularPrice?: number
}

export const LowestPrice30DaysNotice = ({
  priceAfterDiscount,
  regularPrice,
}: LowestPrice30DaysNoticeProps) => {
  const hasPrices =
    priceAfterDiscount != null &&
    priceAfterDiscount > 0 &&
    regularPrice != null &&
    regularPrice > 0

  if (!hasPrices) return null

  return (
    <div
      className="text-[10px] md:text-xs text-gray-500 leading-snug mt-2 px-0.5 space-y-0.5"
      role="note"
    >
      <p>
        <span className="text-gray-400">Najniższa cena w okresie 30 dni przed obniżką: </span>
        <span className="text-gray-300">{formatPricePln(priceAfterDiscount)}</span>
      </p>
      <p>
        <span className="text-gray-400">Cena regularna: </span>
        <span className="text-gray-300">{formatPricePln(regularPrice)}</span>
      </p>
    </div>
  )
}
