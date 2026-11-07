"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

const OptionQueryContext = createContext("")
const InitiallyOpenContext = createContext<ReadonlySet<string> | null>(null)
const SearchTermsContext = createContext<Readonly<Record<string, readonly string[]>>>({})
const RequestedOpenContext = createContext<{ id: string; token: number } | null>(null)

export const CONFIGURATOR_V2_INITIALLY_OPEN_SECTION_IDS = [
  "section-vehicle",
  "section-summary",
] as const

type ConfiguratorV2OptionsProviderProps = {
  query: string
  initiallyOpenSectionIds: readonly string[]
  searchTermsById?: Readonly<Record<string, readonly string[]>>
  requestedOpen?: { id: string; token: number } | null
  children: ReactNode
}

export const ConfiguratorV2OptionsProvider = ({
  query,
  initiallyOpenSectionIds,
  searchTermsById = {},
  requestedOpen = null,
  children,
}: ConfiguratorV2OptionsProviderProps) => {
  const openIds = useMemo(
    () => new Set(initiallyOpenSectionIds),
    [initiallyOpenSectionIds],
  )

  return (
    <OptionQueryContext.Provider value={query}>
      <InitiallyOpenContext.Provider value={openIds}>
        <SearchTermsContext.Provider value={searchTermsById}>
          <RequestedOpenContext.Provider value={requestedOpen}>
            {children}
          </RequestedOpenContext.Provider>
        </SearchTermsContext.Provider>
      </InitiallyOpenContext.Provider>
    </OptionQueryContext.Provider>
  )
}

export const useConfiguratorV2OptionQuery = () => useContext(OptionQueryContext)

export const useConfiguratorV2InitiallyOpenSectionIds = () =>
  useContext(InitiallyOpenContext)

export const useConfiguratorV2SearchTerms = (sectionId: string): readonly string[] =>
  useContext(SearchTermsContext)[sectionId] ?? []

export const useConfiguratorV2RequestedOpen = () => useContext(RequestedOpenContext)
