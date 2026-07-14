"use client"

import type { ReactNode } from "react"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"

type ConfiguratorV2SectionShellProps = {
  id: string
  title: string
  subtitle?: string
  readiness: SectionReadiness
  headerAction?: ReactNode
  children: ReactNode
}

export const ConfiguratorV2SectionShell = ({
  id,
  title,
  subtitle,
  readiness,
  headerAction,
  children,
}: ConfiguratorV2SectionShellProps) => (
  <section
    id={id}
    aria-disabled={readiness.isDisabled}
    className={`scroll-mt-24 transition-opacity duration-200 ${
      readiness.isDisabled ? "opacity-40 pointer-events-none" : "opacity-100"
    }`}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        {readiness.isDisabled && readiness.disabledReason && (
          <p className="text-xs text-amber-400/90 mt-1">{readiness.disabledReason}</p>
        )}
      </div>
      {headerAction}
    </div>
    {children}
  </section>
)
