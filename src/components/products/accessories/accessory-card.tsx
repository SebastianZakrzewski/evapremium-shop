"use client"

import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Accessory } from "@/entities/product"
import { Button } from "@/components/ui/button"
import { formatPriceCurrency } from "@/lib/utils/formatPrice"

interface AccessoryCardProps {
  accessory: Accessory
  onAddToCart: (event: React.MouseEvent) => void
  onView?: () => void
}

const AccessoryCard = ({ accessory, onAddToCart, onView }: AccessoryCardProps) => {
  const displayImage =
    accessory.images && accessory.images.length > 0 ? accessory.images[0] : accessory.imageSrc
  const categoryName =
    accessory.productType === "organizer"
      ? "Organizery do bagażnika"
      : accessory.productType === "podpietka"
        ? "Podpiętki"
        : accessory.category?.name

  const handleOpen = () => {
    onView?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    handleOpen()
  }

  return (
    <article
      className="group block h-full cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#FDFDFD]"
      tabIndex={0}
      aria-label={accessory.name}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-300 bg-[#FDFDFD] transition-all duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={accessory.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Brak zdjęcia
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <div className="mb-1 sm:mb-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-tight text-neutral-950 transition-colors group-hover:text-red-600 sm:text-lg">
              {accessory.name}
            </h3>
          </div>

          <div className="mb-2 flex-1 space-y-1 text-xs text-neutral-500 sm:mb-4 sm:text-sm">
            {categoryName ? <span className="block line-clamp-2">{categoryName}</span> : null}
            {!accessory.inStock ? (
              <span className="block text-[10px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                Niedostępny
              </span>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-200 py-2 sm:gap-3 sm:py-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] text-neutral-500 sm:text-xs">Cena</span>
              <span className="text-sm font-bold leading-tight text-neutral-950 sm:text-xl">
                {formatPriceCurrency(accessory.price)}
              </span>
            </div>

            <Button
              type="button"
              className="h-8 w-8 shrink-0 gap-2 bg-red-600 p-0 text-white transition-all duration-300 hover:bg-red-700 sm:h-9 sm:w-auto sm:px-3"
              size="sm"
              aria-label={`Dodaj ${accessory.name} do koszyka`}
              disabled={!accessory.inStock}
              onClick={onAddToCart}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Dodaj</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default AccessoryCard
