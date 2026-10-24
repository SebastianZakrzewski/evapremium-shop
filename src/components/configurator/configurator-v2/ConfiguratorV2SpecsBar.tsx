"use client"

import { ChevronRight } from "lucide-react"

type ConfiguratorV2SpecsBarProps = {
  title: string
  year?: string
  contextLine?: string
  onLearnMore?: () => void
}

export const ConfiguratorV2SpecsBar = ({
  title,
  year,
  contextLine,
  onLearnMore,
}: ConfiguratorV2SpecsBarProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h1 className="text-[1.75rem] font-normal leading-tight tracking-tight text-white lg:text-[2rem]">
        {title}
      </h1>
      {year && (
        <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-sm text-white/80">
          {year}
        </span>
      )}
    </div>
    {contextLine && (
      <p className="text-sm leading-snug text-white/60">{contextLine}</p>
    )}
    {onLearnMore && (
      <button
        type="button"
        onClick={onLearnMore}
        className="text-sm text-white underline underline-offset-4 hover:text-white/80"
      >
        Dowiedz się więcej
      </button>
    )}
  </div>
)

type ConfiguratorV2IntroCardProps = {
  onLearnMore: () => void
}

export const ConfiguratorV2IntroCard = ({
  onLearnMore,
}: ConfiguratorV2IntroCardProps) => (
  <button
    type="button"
    onClick={onLearnMore}
    className="flex w-full items-center justify-between gap-4 rounded-3xl bg-white/10 px-5 py-4 text-left transition-colors hover:bg-white/15"
  >
    <span className="min-w-0">
      <span className="block text-base font-semibold leading-snug text-white">
        Dowiedz się więcej o dywanikach EVA
      </span>
      <span className="mt-1 block text-sm leading-snug text-white/65">
        Poznaj materiał, strukturę komórek i wykończenie.
      </span>
    </span>
    <ChevronRight className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
  </button>
)
