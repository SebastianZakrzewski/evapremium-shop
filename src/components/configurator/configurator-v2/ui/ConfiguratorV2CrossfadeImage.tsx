"use client"

import { useCrossfadeImageSrc } from "../hooks/useCrossfadeImageSrc"

type ConfiguratorV2CrossfadeImageProps = {
  imageSrc: string
  alt: string
  className?: string
  priority?: boolean
}

const imageClassName =
  "absolute inset-0 h-full w-full object-contain object-center select-none pointer-events-none"

export const ConfiguratorV2CrossfadeImage = ({
  imageSrc,
  alt,
  priority = false,
}: ConfiguratorV2CrossfadeImageProps) => {
  const { front, back, durationMs } = useCrossfadeImageSrc(imageSrc)

  const transitionStyle = {
    transitionProperty: "opacity",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: "ease-in-out",
    willChange: "opacity",
  } as const

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={back.src}
        alt=""
        aria-hidden
        decoding="async"
        draggable={false}
        className={imageClassName}
        style={{ ...transitionStyle, opacity: back.opacity, zIndex: 1 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={front.src}
        alt={alt}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        draggable={false}
        className={imageClassName}
        style={{ ...transitionStyle, opacity: front.opacity, zIndex: 2 }}
      />
    </div>
  )
}
