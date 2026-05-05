"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageComparisonSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  leftImage: string
  rightImage: string
  altLeft?: string
  altRight?: string
  initialPosition?: number
  leftLabel?: string
  rightLabel?: string
}

export const ImageComparisonSlider = React.forwardRef<
  HTMLDivElement,
  ImageComparisonSliderProps
>(
  (
    {
      className,
      leftImage,
      rightImage,
      altLeft = "Left image",
      altRight = "Right image",
      initialPosition = 50,
      leftLabel,
      rightLabel,
      ...props
    },
    ref
  ) => {
    const [sliderPosition, setSliderPosition] = React.useState(initialPosition)
    const [isDragging, setIsDragging] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const handleMove = (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      let newPosition = (x / rect.width) * 100
      newPosition = Math.max(0, Math.min(100, newPosition))
      setSliderPosition(newPosition)
    }

    const handleMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!isDragging) return
        handleMove(e.clientX)
      },
      [isDragging]
    )

    const handleTouchMove = React.useCallback(
      (e: TouchEvent) => {
        if (!isDragging) return
        handleMove(e.touches[0].clientX)
      },
      [isDragging]
    )

    const handleInteractionStart = () => setIsDragging(true)
    const handleInteractionEnd = () => setIsDragging(false)

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("touchmove", handleTouchMove)
        document.addEventListener("mouseup", handleInteractionEnd)
        document.addEventListener("touchend", handleInteractionEnd)
        document.body.style.cursor = "ew-resize"
      } else {
        document.body.style.cursor = ""
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("mouseup", handleInteractionEnd)
        document.removeEventListener("touchend", handleInteractionEnd)
        document.body.style.cursor = ""
      }
    }, [isDragging, handleMouseMove, handleTouchMove])

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full overflow-hidden select-none group",
          className
        )}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        role="presentation"
        {...props}
      >
        {/* Right Image — bottom layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rightImage}
          alt={altRight}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        {/* Right label */}
        {rightLabel && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-semibold pointer-events-none">
            {rightLabel}
          </div>
        )}

        {/* Left Image — top layer, clipped */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={leftImage}
            alt={altLeft}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Left label */}
          {leftLabel && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-sm font-semibold">
              {leftLabel}
            </div>
          )}
        </div>

        {/* Slider handle & divider */}
        <div
          className="absolute top-0 h-full w-1 cursor-ew-resize"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="absolute inset-y-0 w-0.5 bg-white/60 backdrop-blur-sm" />

          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-12 w-12 flex items-center justify-center rounded-full bg-white/20 text-white shadow-xl backdrop-blur-md border border-white/30",
              "transition-all duration-200 ease-in-out",
              "group-hover:scale-110",
              isDragging && "scale-110 shadow-2xl shadow-red-500/40 bg-red-600/40"
            )}
            role="slider"
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-orientation="horizontal"
            aria-label="Suwak porównania zdjęć"
            tabIndex={0}
          >
            <div className="flex items-center text-white">
              <ChevronLeft className="h-5 w-5 drop-shadow-md" />
              <ChevronRight className="h-5 w-5 drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ImageComparisonSlider.displayName = "ImageComparisonSlider"
