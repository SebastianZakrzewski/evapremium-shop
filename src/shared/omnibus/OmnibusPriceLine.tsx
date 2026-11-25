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
        ? "mt-2 block text-[15px] font-medium leading-snug text-white"
        : "mt-2 block text-[15px] font-medium leading-snug text-neutral-950"
    }
  >
    {omnibusPriceText(amount)}
  </span>
)
