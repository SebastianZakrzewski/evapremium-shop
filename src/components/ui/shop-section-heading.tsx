import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type ShopSectionHeadingProps = {
  kicker?: string
  title: string
  description?: ReactNode
  className?: string
}

export default function ShopSectionHeading({
  kicker,
  title,
  description,
  className,
}: ShopSectionHeadingProps) {
  return (
    <div className={cn("text-center", className)}>
      {kicker ? (
        <p className="text-[11px] uppercase tracking-[0.28em] text-red-600">{kicker}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-neutral-950 md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-xl text-sm font-normal leading-relaxed text-neutral-600 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
