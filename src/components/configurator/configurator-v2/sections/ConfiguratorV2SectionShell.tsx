"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { sectionHeaderMatchesQuery } from "../option-search/sectionHeaderMatchesQuery"
import {
  useConfiguratorV2InitiallyOpenSectionIds,
  useConfiguratorV2OptionQuery,
} from "../option-search/ConfiguratorV2OptionsProvider"

type ConfiguratorV2SectionShellProps = {
  id: string
  title: string
  headingId?: string
  selectedLabel?: string
  included?: boolean
  readiness: SectionReadiness
  headerAction?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export const ConfiguratorV2SectionShell = ({
  id,
  title,
  headingId,
  selectedLabel,
  included = false,
  readiness,
  headerAction,
  defaultOpen = true,
  children,
}: ConfiguratorV2SectionShellProps) => {
  const optionQuery = useConfiguratorV2OptionQuery()
  const initiallyOpenSectionIds = useConfiguratorV2InitiallyOpenSectionIds()
  const matchesQuery = sectionHeaderMatchesQuery(title, optionQuery)
  const [isOpen, setIsOpen] = useState(() => {
    if (readiness.isDisabled) return false
    if (optionQuery.trim() && matchesQuery) return true
    if (initiallyOpenSectionIds) return initiallyOpenSectionIds.has(id)
    return defaultOpen
  })

  useEffect(() => {
    if (!optionQuery.trim() || !matchesQuery || readiness.isDisabled) return
    setIsOpen(true)
  }, [matchesQuery, optionQuery, readiness.isDisabled])

  const expanded = isOpen && !readiness.isDisabled
  const visible = matchesQuery

  return (
    <section
      id={id}
      aria-disabled={readiness.isDisabled}
      hidden={!visible}
      className={`scroll-mt-4 border-b border-white/10 py-2 last:border-b-0 ${
        readiness.isDisabled ? "opacity-50" : ""
      }`}
    >
      <h2 id={headingId} className="text-lg font-semibold text-white">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-3xl px-3 py-3 text-left hover:bg-white/5 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
          disabled={readiness.isDisabled}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{title}</span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
          )}
        </button>
      </h2>

      {(selectedLabel || readiness.disabledReason) && (
        <div className="px-3 pb-2">
          {selectedLabel && (
            <p className="text-sm text-white/80">{selectedLabel}</p>
          )}
          {readiness.isDisabled && readiness.disabledReason && (
            <p className="mt-1 text-xs text-amber-400/90">
              {readiness.disabledReason}
            </p>
          )}
        </div>
      )}

      <div id={`${id}-panel`} hidden={!expanded} className="px-3 pb-4">
        {included && (
          <p className="mb-2 text-[11px] font-medium text-white/50">W zestawie</p>
        )}
        {headerAction && (
          <div className="mb-3 flex justify-end">{headerAction}</div>
        )}
        {children}
      </div>
    </section>
  )
}
