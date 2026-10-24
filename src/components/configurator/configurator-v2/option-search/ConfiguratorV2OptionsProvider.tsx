"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

const OptionQueryContext = createContext("")
const InitiallyOpenContext = createContext<ReadonlySet<string> | null>(null)

export const CONFIGURATOR_V2_INITIALLY_OPEN_SECTION_IDS = [
  "section-vehicle",
  "section-summary",
] as const

type ConfiguratorV2OptionsProviderProps = {
  query: string
  initiallyOpenSectionIds: readonly string[]
  children: ReactNode
}

export const ConfiguratorV2OptionsProvider = ({
  query,
  initiallyOpenSectionIds,
  children,
}: ConfiguratorV2OptionsProviderProps) => {
  const openIds = useMemo(
    () => new Set(initiallyOpenSectionIds),
    [initiallyOpenSectionIds],
  )

  return (
    <OptionQueryContext.Provider value={query}>
      <InitiallyOpenContext.Provider value={openIds}>
        {children}
      </InitiallyOpenContext.Provider>
    </OptionQueryContext.Provider>
  )
}

export const useConfiguratorV2OptionQuery = () => useContext(OptionQueryContext)

export const useConfiguratorV2InitiallyOpenSectionIds = () =>
  useContext(InitiallyOpenContext)
