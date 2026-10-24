"use client"

import { Accessory } from "@/entities/product"
import { ProductRevealCard, type ProductRevealFeature } from "@/components/ui/product-reveal-card"
import { formatPriceCurrency } from "@/lib/utils/formatPrice"

interface AccessoryCardProps {
  accessory: Accessory
  onAddToCart: (e: React.MouseEvent) => void
  onView?: () => void
}

function reviewCountOf(accessory: Accessory) {
  const record = accessory as Accessory & { review_count?: number | null }
  const value = record.reviewCount ?? record.review_count ?? 0
  return Number.isFinite(value) ? value : 0
}

function featurePair(accessory: Accessory): ProductRevealFeature[] {
  const labels = (accessory.features ?? []).map((feature) => feature.trim()).filter(Boolean)
  const fallback =
    accessory.productType === "organizer"
      ? ["Do bagażnika", "EVA Premium"]
      : ["Pod piętę", "Antypoślizgowa"]

  return [labels[0] ?? fallback[0], labels[1] ?? fallback[1]].map((label) => ({ label }))
}

export default function AccessoryCard({ accessory, onAddToCart, onView }: AccessoryCardProps) {
  const displayImage =
    accessory.images && accessory.images.length > 0 ? accessory.images[0] : accessory.imageSrc

  return (
    <ProductRevealCard
      name={accessory.name}
      price={formatPriceCurrency(accessory.price)}
      originalPrice={
        accessory.originalPrice && accessory.originalPrice > accessory.price
          ? formatPriceCurrency(accessory.originalPrice)
          : ""
      }
      image={displayImage ?? ""}
      description={accessory.description?.trim() || "Sprawdź szczegóły tego akcesorium."}
      rating={accessory.rating ?? 0}
      reviewCount={reviewCountOf(accessory)}
      features={featurePair(accessory)}
      inStock={accessory.inStock}
      onAdd={onAddToCart}
      onView={onView}
    />
  )
}
