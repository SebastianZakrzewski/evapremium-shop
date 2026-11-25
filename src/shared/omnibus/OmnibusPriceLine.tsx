import { formatPricePln } from "@/lib/utils/formatPrice"

export const omnibusPriceText = (amount: number): string =>
  `Najniższa cena z 30 dni przed obniżką: ${formatPricePln(amount)}`

type OmnibusPriceLineProps = {
  amount: number
  tone?: "dark" | "light"
}

export const OmnibusPriceLine = ({ amount, tone = "dark" }: OmnibusPriceLineProps) => (
  <span
    className={
      tone === "light"
        ? "mt-1 block text-[11px] font-normal leading-snug text-neutral-200 md:text-xs"
        : "mt-1 block text-[11px] font-normal leading-snug text-neutral-600 md:text-xs"
    }
  >
    {omnibusPriceText(amount)}
  </span>
)
