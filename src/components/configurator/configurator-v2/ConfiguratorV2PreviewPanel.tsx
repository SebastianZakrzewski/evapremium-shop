"use client"

import { ConfiguratorPreviewFrame } from "@/components/configurator/configurator-simple/ConfiguratorPreviewFrame"

type ConfiguratorV2PreviewPanelProps = {
  imageSrc: string
  alt: string
  onOpenZoom?: () => void
}

export const ConfiguratorV2PreviewPanel = ({
  imageSrc,
  alt,
  onOpenZoom,
}: ConfiguratorV2PreviewPanelProps) => (
  <ConfiguratorPreviewFrame
    imageSrc={imageSrc}
    alt={alt}
    imageFit="contain"
    imageKey={imageSrc}
    priority
    onOpen={onOpenZoom}
    fillHeight
    className="w-full h-full min-h-0 rounded-xl border border-white/10 overflow-hidden"
  />
)
