"use client"

import { motion, type Variants } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Star, Heart } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface ProductRevealFeature {
  label: string
  hint?: string
}

interface ProductRevealCardProps {
  name?: string
  price?: string
  originalPrice?: string
  image?: string
  description?: string
  rating?: number
  reviewCount?: number
  features?: ProductRevealFeature[]
  inStock?: boolean
  addLabel?: string
  detailsLabel?: string
  detailsTitle?: string
  onAdd?: (event: React.MouseEvent<HTMLButtonElement>) => void
  onView?: () => void
  onFavorite?: () => void
  enableAnimations?: boolean
  className?: string
}

const cardFont =
  "[font-family:var(--font-inter),ui-sans-serif,system-ui,sans-serif]"

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80"

const FALLBACK_FEATURES: ProductRevealFeature[] = [
  { label: "30h Battery", hint: "Long-lasting" },
  { label: "Noise Cancel", hint: "Studio quality" },
]

function parseAmount(value?: string) {
  if (!value) return Number.NaN
  const match = value.replace(/\s/g, "").replace(",", ".").match(/-?\d+(\.\d+)?/)
  return match ? Number.parseFloat(match[0]) : Number.NaN
}

function discountPercent(price?: string, originalPrice?: string) {
  const current = parseAmount(price)
  const original = parseAmount(originalPrice)
  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current) return null
  return Math.round(((original - current) / original) * 100)
}

function opinionLabel(count: number) {
  if (count === 1) return "opinia"
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "opinie"
  return "opinii"
}

export function ProductRevealCard({
  name = "Premium Wireless Headphones",
  price = "$199",
  originalPrice = "$299",
  image = DEFAULT_IMAGE,
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  rating = 4.8,
  reviewCount = 124,
  features,
  inStock = true,
  addLabel = "Dodaj do koszyka",
  detailsLabel = "Zobacz szczegóły",
  detailsTitle = "Szczegóły",
  onAdd,
  onView,
  onFavorite,
  enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const shouldAnimate = enableAnimations
  const revealed = shouldAnimate && (hovered || pinned)
  const photo = image.trim()
  const sale = discountPercent(price, originalPrice)
  const featureItems = [
    features?.[0] ?? FALLBACK_FEATURES[0],
    features?.[1] ?? FALLBACK_FEATURES[1],
  ]

  const containerVariants: Variants = {
    rest: { scale: 1, y: 0, filter: "blur(0px)" },
    hover: shouldAnimate
      ? {
          scale: 1.03,
          y: -8,
          filter: "blur(0px)",
          transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
        }
      : {},
  }

  const imageVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
  }

  const overlayVariants: Variants = {
    rest: { y: "100%", opacity: 0, filter: "blur(4px)" },
    hover: {
      y: "0%",
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const contentVariants: Variants = {
    rest: { opacity: 0, y: 20, scale: 0.95 },
    hover: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 25, mass: 0.5 },
    },
  }

  const handleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsFavorite((current) => !current)
    onFavorite?.()
  }

  return (
    <motion.div
      data-slot="product-reveal-card"
      data-allow-motion="true"
      initial="rest"
      animate={revealed ? "hover" : "rest"}
      variants={containerVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest("[data-card-action]")) return
        if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
          setPinned((current) => !current)
        }
      }}
      className={cn(
        "group relative h-[24.5rem] w-80 max-w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl",
        "border border-white/10 bg-[#171717] text-white shadow-lg shadow-black/40",
        cardFont,
        className
      )}
    >
      <div className="relative h-56 overflow-hidden bg-[#171717]">
        {photo ? (
          <motion.img
            src={photo}
            alt={name}
            data-allow-motion="true"
            className="h-56 w-full object-cover"
            variants={imageVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center text-sm text-white/40">
            Brak zdjęcia
          </div>
        )}
        <motion.button
          type="button"
          data-card-action
          data-allow-motion="true"
          onClick={handleFavorite}
          animate={
            isFavorite
              ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          className={cn(
            "absolute right-4 top-4 rounded-full border border-white/20 p-2 backdrop-blur-sm",
            isFavorite ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
        </motion.button>

        {sale !== null && (
          <motion.div
            initial={shouldAnimate ? { opacity: 0, scale: 0.8, x: 20 } : false}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute left-4 top-4 rounded-full bg-[#fb2c36] px-3 py-1 text-xs font-bold text-white"
          >
            -{sale}%
          </motion.div>
        )}
      </div>

      <div className="flex h-[10.5rem] flex-col gap-3 bg-[#171717] px-6 py-5">
        <div className="flex h-5 items-center gap-2">
          <div className="flex" aria-hidden="true">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-4 w-4",
                  index < Math.floor(rating) ? "fill-current text-yellow-400" : "text-white/25"
                )}
              />
            ))}
          </div>
          <span className={cn(cardFont, "truncate text-sm font-normal tracking-normal text-white/55")}>
            {rating} ({reviewCount} {opinionLabel(reviewCount)})
          </span>
        </div>

        <div className="space-y-1">
          <h3 className={cn(cardFont, "line-clamp-2 h-[3.25rem] text-xl font-bold leading-tight tracking-tight text-white")}>
            {name}
          </h3>
          <div className="flex h-8 items-baseline gap-2">
            <span className={cn(cardFont, "text-2xl font-bold leading-none tracking-tight text-white")}>{price}</span>
            {sale !== null && originalPrice.trim() && (
              <span className={cn(cardFont, "truncate text-lg font-normal leading-none text-white/40 line-through")}>
                {originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      <motion.div
        data-allow-motion="true"
        variants={overlayVariants}
        className="absolute inset-0 flex flex-col justify-end bg-[#0a0a0a]/95 backdrop-blur-xl"
      >
        <div className="space-y-4 p-6">
          <motion.div data-allow-motion="true" variants={contentVariants}>
            <h4 className={cn(cardFont, "mb-2 text-sm font-semibold tracking-tight text-white")}>{detailsTitle}</h4>
            <p className={cn(cardFont, "line-clamp-3 h-[4.2rem] text-sm font-normal leading-relaxed tracking-normal text-white/60")}>
              {description}
            </p>
          </motion.div>

          <motion.div data-allow-motion="true" variants={contentVariants}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {featureItems.map((feature) => (
                <div
                  key={feature.label}
                  className="flex h-14 flex-col items-center justify-center rounded-lg bg-white/5 p-2 text-center"
                >
                  <div className="line-clamp-2 font-semibold text-white">{feature.label}</div>
                  {feature.hint && (
                    <div className="line-clamp-1 text-white/50">{feature.hint}</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div data-allow-motion="true" variants={contentVariants} className="space-y-3">
            <button
              type="button"
              data-card-action
              disabled={!inStock}
              onClick={(event) => {
                event.stopPropagation()
                if (!inStock) return
                onAdd?.(event)
              }}
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 w-full bg-red-600 font-medium text-white shadow-lg shadow-red-950/25 transition-transform hover:scale-105 hover:bg-red-500 active:scale-95",
                !inStock && "cursor-not-allowed bg-white/10 text-white/40 shadow-none hover:scale-100 hover:bg-white/10"
              )}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inStock ? addLabel : "Niedostępny"}
            </button>

            <button
              type="button"
              data-card-action
              onClick={(event) => {
                event.stopPropagation()
                onView?.()
              }}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full border-white/20 bg-transparent font-medium text-white transition-transform hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95"
              )}
            >
              {detailsLabel}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
