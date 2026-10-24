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
      <h1 className="text-[1.75rem] font-medium leading-tight tracking-tight text-white lg:text-[2rem]">
        {title}
      </h1>
      {year && (
        <span className="inline-flex items-center rounded-full bg-[#1c1c1e] px-2.5 py-0.5 text-[13px] font-medium text-white/70">
          {year}
        </span>
      )}
    </div>
    {contextLine && (
      <p className="text-[13px] leading-snug text-white/55">{contextLine}</p>
    )}
    {onLearnMore && (
      <button
        type="button"
        onClick={onLearnMore}
        className="text-[13px] font-medium text-red-500 transition-colors hover:text-red-400"
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
    className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#1c1c1e] px-5 py-4 text-left transition-colors hover:bg-[#2c2c2e]"
  >
    <span className="min-w-0">
      <span className="block text-[15px] font-medium leading-snug tracking-tight text-white">
        Dowiedz się więcej o dywanikach EVA
      </span>
      <span className="mt-1 block text-[13px] leading-snug text-white/55">
        Poznaj materiał, strukturę komórek i wykończenie.
      </span>
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-white/35" aria-hidden />
  </button>
)
