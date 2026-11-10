"use client"

import type { ReactNode } from "react"
import { TESLA_LAYOUT } from "../tokens"

type TeslaSectionProps = {
  id: string
  title: string
  etap: number
  children: ReactNode
}

export const TeslaSection = ({ id, title, etap, children }: TeslaSectionProps) => (
  <section
    id={id}
    aria-label={title}
    data-configurator-section
    data-section-name={title}
    data-etap={etap}
    style={{ marginTop: TESLA_LAYOUT.sectionGap }}
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
