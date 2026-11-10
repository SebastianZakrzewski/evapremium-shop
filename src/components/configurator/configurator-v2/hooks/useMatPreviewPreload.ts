"use client"

import { useEffect, useRef } from "react"
import { buildMatPreviewPreloadPaths } from "./buildMatPreviewPreloadPaths"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

type UseMatPreviewPreloadProps = Pick<
  ConfiguratorState,
  "matType" | "pricingCategoryKey" | "structure" | "color" | "edgeColor" | "variant"
> & {
  extraPaths?: string[]
}

export const useMatPreviewPreload = ({
  extraPaths = [],
  ...config
}: UseMatPreviewPreloadProps) => {
  const skipInitialPreloadRef = useRef(true)

  useEffect(() => {
    if (skipInitialPreloadRef.current) {
      skipInitialPreloadRef.current = false
      return
    }

    const paths = [
      ...buildMatPreviewPreloadPaths(config),
      ...extraPaths,
    ]

    paths.forEach((path) => {
      const img = new window.Image()
      img.src = path
    })
  }, [
    config.matType,
    config.pricingCategoryKey,
    config.structure,
    config.color,
    config.edgeColor,
    config.variant,
    extraPaths.join("|"),
  ])
}
