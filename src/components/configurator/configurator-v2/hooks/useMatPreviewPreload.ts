"use client"

import { useEffect } from "react"
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
  useEffect(() => {
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
