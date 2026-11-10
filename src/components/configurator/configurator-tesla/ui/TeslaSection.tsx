"use client"

import type { ReactNode } from "react"
import { TESLA_LAYOUT } from "../tokens"

type TeslaSectionProps = {
  id: string
  title: string
  etap: number
  children: ReactNode
  /** Less air when this section sits directly under the pinned image. */
  tight?: boolean
}

export const TeslaSection = ({ id, title, etap, children, tight = false }: TeslaSectionProps) => (
  <section
    id={id}
    aria-label={title}
    data-configurator-section
    data-section-name={title}
    data-etap={etap}
    style={{
      marginTop: tight ? 12 : TESLA_LAYOUT.sectionGap,
      scrollMarginTop: "calc(var(--configurator-header-offset, 4rem) + 236px)",
    }}
  >
    <h2
      className="font-medium"
      style={{
        fontSize: TESLA_LAYOUT.sectionTitleSize,
        lineHeight: `${TESLA_LAYOUT.sectionTitleLine}px`,
        color: TESLA_LAYOUT.text,
        marginBottom: 12,
      }}
    >
      {title}
    </h2>
    {children}
  </section>
)
