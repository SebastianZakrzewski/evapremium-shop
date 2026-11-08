"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { SectionReadiness } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { sectionMatchesOptionQuery } from "../option-search/sectionMatchesOptionQuery"
import {
  useConfiguratorV2InitiallyOpenSectionIds,
  useConfiguratorV2OptionQuery,
  useConfiguratorV2RequestedOpen,
  useConfiguratorV2SearchTerms,
} from "../option-search/ConfiguratorV2OptionsProvider"

const MOBILE_LAYOUT_QUERY = "(max-width: 1023px)"

const isMobileLayout = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(MOBILE_LAYOUT_QUERY).matches

type ConfiguratorV2SectionShellProps = {
  id: string
  title: string
  headingId?: string
  selectedLabel?: string
  included?: boolean
  readiness: SectionReadiness
  headerAction?: ReactNode
  defaultOpen?: boolean
  className?: string
  panelClassName?: string
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
  className = "",
  panelClassName = "",
  children,
}: ConfiguratorV2SectionShellProps) => {
  const optionQuery = useConfiguratorV2OptionQuery()
  const searchTerms = useConfiguratorV2SearchTerms(id)
  const requestedOpen = useConfiguratorV2RequestedOpen()
  const initiallyOpenSectionIds = useConfiguratorV2InitiallyOpenSectionIds()
  const [desktopSearch, setDesktopSearch] = useState(false)
  const seenOpenToken = useRef(0)
  const matchesQuery = sectionMatchesOptionQuery(
    title,
    searchTerms,
    desktopSearch ? optionQuery : "",
  )
  const [isOpen, setIsOpen] = useState(() => {
    if (readiness.isDisabled) return false
    if (optionQuery.trim() && matchesQuery) return true
    if (initiallyOpenSectionIds) return initiallyOpenSectionIds.has(id)
    return defaultOpen
  })
  const [hasMounted, setHasMounted] = useState(false)
  const didApplyMobileOpen = useRef(false)

  useEffect(() => {
    setHasMounted(true)
    if (typeof window.matchMedia !== "function") {
      setDesktopSearch(true)
      return
    }
    const media = window.matchMedia("(min-width: 1024px)")
    const apply = () => setDesktopSearch(media.matches)
    apply()
    media.addEventListener("change", apply)
    if (didApplyMobileOpen.current || readiness.isDisabled) {
      return () => media.removeEventListener("change", apply)
    }
    didApplyMobileOpen.current = true
    if (isMobileLayout()) setIsOpen(true)
    return () => media.removeEventListener("change", apply)
  }, [readiness.isDisabled])

  useEffect(() => {
    if (!optionQuery.trim() || !matchesQuery || readiness.isDisabled || !desktopSearch) return
    setIsOpen(true)
  }, [desktopSearch, matchesQuery, optionQuery, readiness.isDisabled])

  useEffect(() => {
    if (!requestedOpen || requestedOpen.token === seenOpenToken.current) return
    if (requestedOpen.id !== id) return
    seenOpenToken.current = requestedOpen.token
    setIsOpen(true)
  }, [id, requestedOpen])

  const expanded = isOpen && !readiness.isDisabled
  const showOnMobileBeforeMount = !hasMounted && !readiness.isDisabled
  const panelVisible = expanded || showOnMobileBeforeMount
  const visible = matchesQuery

  return (
    <section
      id={id}
      aria-disabled={readiness.isDisabled}
      hidden={!visible}
      className={`scroll-mt-4 border-b border-neutral-200 py-1.5 last:border-b-0 ${
        readiness.isDisabled ? "opacity-40" : ""
      } ${className}`}
    >
      <h2 id={headingId} className="text-[17px] font-medium tracking-tight text-neutral-950">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-expanded={panelVisible}
          aria-controls={`${id}-panel`}
          disabled={readiness.isDisabled}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span>{title}</span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
          ) : showOnMobileBeforeMount ? (
            <>
              <ChevronUp className="h-4 w-4 shrink-0 text-neutral-500 lg:hidden" aria-hidden />
              <ChevronDown className="hidden h-4 w-4 shrink-0 text-neutral-500 lg:block" aria-hidden />
            </>
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
          )}
        </button>
      </h2>

      {(selectedLabel || readiness.disabledReason) && (
        <div className="px-3 pb-2">
          {selectedLabel && (
            <p className="text-[13px] text-neutral-600">{selectedLabel}</p>
          )}
          {readiness.isDisabled && readiness.disabledReason && (
            <p className="mt-1 text-[13px] leading-snug text-neutral-800" role="status">
              {readiness.disabledReason}
            </p>
          )}
        </div>
      )}

      <div
        id={`${id}-panel`}
        hidden={panelVisible ? undefined : true}
        className={`px-3 pb-4 ${panelClassName} ${showOnMobileBeforeMount && !expanded ? "max-lg:!block lg:hidden" : ""}`}
      >
        {included && (
          <p className="mb-2 text-[11px] font-medium tracking-wide text-neutral-500">W zestawie</p>
        )}
        {headerAction && (
          <div className="mb-3 flex justify-end">{headerAction}</div>
        )}
        {children}
      </div>
    </section>
  )
}
