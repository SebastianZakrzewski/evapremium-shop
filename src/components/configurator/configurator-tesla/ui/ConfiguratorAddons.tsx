"use client"

import Image from "next/image"
import type { Accessory } from "@/entities/product"
import { formatPriceValue } from "@/lib/utils/formatPrice"
import { AntiDirtIcon, PremiumStitchIcon } from "./addonIcons"

type ConfiguratorAddonsProps = {
  accessories: Accessory[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

const finishIcon = (sku: string) => {
  if (sku === "WYK-ANTI-DIRT") return AntiDirtIcon
  if (sku === "WYK-SZWY-PREMIUM") return PremiumStitchIcon
  return null
}

const AddonRow = ({
  accessory,
  selected,
  onToggle,
}: {
  accessory: Accessory
  selected: boolean
  onToggle: (id: string) => void
}) => {
  const image = accessory.images?.[0] ?? accessory.imageSrc
  const Icon = accessory.productType === "wykonczenie" ? finishIcon(accessory.sku) : null
  return (
    <div
      className="flex items-center gap-3 border bg-white p-3"
      style={{ borderRadius: 4, borderColor: selected ? "#171a20" : "#d0d1d2", borderWidth: 2 }}
    >
      <div
        className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-neutral-100 text-neutral-950"
        style={{ borderRadius: 4 }}
      >
        {Icon ? (
          <Icon className="h-10 w-10" />
        ) : image ? (
          <Image src={image} alt="" fill className="object-cover" sizes="64px" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-5 text-neutral-950">{accessory.name}</p>
        {accessory.description ? (
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-neutral-600">
            {accessory.description}
          </p>
        ) : null}
        <p className="mt-1 text-sm leading-5 text-neutral-950">{formatPriceValue(accessory.price)} zł</p>
      </div>
      <button
        type="button"
        className="h-10 shrink-0 rounded px-3 text-sm font-medium"
        style={{ minWidth: 88, minHeight: 40, border: "1px solid #171a20" }}
        aria-pressed={selected}
        onClick={() => onToggle(accessory.id)}
      >
        {selected ? "Usuń" : "Dodaj"}
      </button>
    </div>
  )
}

export const ConfiguratorAddons = ({
  accessories,
  selectedIds,
  onToggle,
}: ConfiguratorAddonsProps) => {
  const organizers = accessories.filter(
    (item) => item.productType === "organizer" && item.isActive !== false && item.inStock !== false,
  )
  const finishes = accessories.filter(
    (item) => item.productType === "wykonczenie" && item.isActive !== false && item.inStock !== false,
  )
  if (organizers.length === 0 && finishes.length === 0) return null
  return (
    <div className="mt-6 flex flex-col gap-6">
      {organizers.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-950">Organizery do bagażnika</h3>
          <div className="flex flex-col gap-2">
            {organizers.map((item) => (
              <AddonRow
                key={item.id}
                accessory={item}
                selected={selectedIds.includes(item.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ) : null}
      {finishes.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium text-neutral-950">Wykończenie dywanika</h3>
          <div className="flex flex-col gap-2">
            {finishes.map((item) => (
              <AddonRow
                key={item.id}
                accessory={item}
                selected={selectedIds.includes(item.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
