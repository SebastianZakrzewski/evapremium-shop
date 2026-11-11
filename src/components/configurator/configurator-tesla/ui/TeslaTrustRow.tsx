import Link from "next/link"
import { TESLA_LAYOUT } from "../tokens"

const items = [
  {
    title: "Dostawa",
    body: "Kompletowanie do 14 dni roboczych. Kurier zazwyczaj do 7 dni roboczych, tylko w Polsce.",
    href: "/zasady-dostawy-platnosci",
  },
  {
    title: "Gwarancja",
    body: "Gwarancja Sprzedawcy 12 miesięcy od dnia dostarczenia.",
    href: "/zwroty-wymiany",
  },
  {
    title: "Zwroty",
    body: "Dywaniki są wytwarzane na zamówienie. Prawo odstąpienia według regulaminu i ustawy.",
    href: "/zwroty-wymiany",
  },
] as const

export const TeslaTrustRow = () => (
  <ul
    className="grid gap-4 sm:grid-cols-3"
    style={{ marginTop: TESLA_LAYOUT.sectionGap }}
  >
    {items.map((item) => (
      <li key={item.title}>
        <p
          className="font-medium"
          style={{
            fontSize: TESLA_LAYOUT.bodySize,
            lineHeight: `${TESLA_LAYOUT.bodyLine}px`,
            color: TESLA_LAYOUT.text,
          }}
        >
          {item.title}
        </p>
        <p
          style={{
            fontSize: TESLA_LAYOUT.captionSize,
            lineHeight: `${TESLA_LAYOUT.captionLine}px`,
            color: TESLA_LAYOUT.muted,
            marginTop: 4,
          }}
        >
          {item.body}{" "}
          <Link href={item.href} className="underline">
            Szczegóły
          </Link>
        </p>
      </li>
    ))}
  </ul>
)
