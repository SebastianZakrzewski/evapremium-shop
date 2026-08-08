"use client"

import type { ReactNode } from "react"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"

type ConfiguratorV2SectionShellProps = {
  id: string
  title: string
  headingId?: string
  selectedLabel?: string
  included?: boolean
  readiness: SectionReadiness
  headerAction?: ReactNode
  children: ReactNode
}

/** Sekcja w układzie Tesla: divider, etykieta „W zestawie”, wybrana wartość */
export const ConfiguratorV2SectionShell = ({
  id,
  title,
  headingId,
  selectedLabel,
  included = false,
  readiness,
  headerAction,
  children,
}: ConfiguratorV2SectionShellProps) => (
    <section
    id={id}
    aria-disabled={readiness.isDisabled}
    className={`scroll-mt-6 border-b border-white/10 py-6 md:py-8 last:border-b-0 transition-opacity duration-200 ${
      readiness.isDisabled ? "opacity-40 pointer-events-none" : "opacity-100"
    }`}
  >
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="min-w-0">
        {included && (
          <p className="text-[11px] font-medium text-gray-400 mb-1">W zestawie</p>
        )}
        <h2 id={headingId} className="text-base font-semibold text-white">
          {selectedLabel ?? title}
        </h2>
        {selectedLabel && (
          <p className="text-xs text-gray-500 mt-0.5">{title}</p>
        )}
        {readiness.isDisabled && readiness.disabledReason && (
          <p className="text-xs text-amber-400/90 mt-2">{readiness.disabledReason}</p>
        )}
      </div>
      {headerAction}
    </div>
    {children}
  </section>
)
