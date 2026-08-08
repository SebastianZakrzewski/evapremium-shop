"use client"

import { useCrossfadeImageSrc } from "../hooks/useCrossfadeImageSrc"

type ConfiguratorV2CrossfadeImageProps = {
  imageSrc: string
  alt: string
  className?: string
  canvasClassName?: string
  priority?: boolean
}

const imageClassName =
  "absolute inset-0 h-full w-full object-contain object-center select-none pointer-events-none"

export const ConfiguratorV2CrossfadeImage = ({
  imageSrc,
  alt,
  canvasClassName = "bg-[#111]",
  priority = false,
}: ConfiguratorV2CrossfadeImageProps) => {
  const { layers, durationMs } = useCrossfadeImageSrc(imageSrc)
  const [baseLayer, topLayer] = layers

  const transitionStyle = {
    transitionProperty: "opacity",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "opacity",
  } as const

  return (
    <div className={`absolute inset-0 overflow-hidden ${canvasClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={baseLayer.src}
        alt=""
        aria-hidden
        decoding="async"
        draggable={false}
        className={imageClassName}
        style={{
          ...transitionStyle,
          opacity: baseLayer.opacity,
          zIndex: baseLayer.zIndex,
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={topLayer.src}
        alt={alt}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className={imageClassName}
        style={{
          ...transitionStyle,
          opacity: topLayer.opacity,
          zIndex: topLayer.zIndex,
        }}
      />
    </div>
  )
}
