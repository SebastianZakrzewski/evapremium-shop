"use client"

import { useCallback } from "react"
import type { ConfiguratorV2SectionId } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"

export const useConfiguratorV2Sections = () => {
  const scrollToSection = useCallback((sectionId: ConfiguratorV2SectionId) => {
    const element = document.getElementById(`section-${sectionId}`)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return { scrollToSection }
}
