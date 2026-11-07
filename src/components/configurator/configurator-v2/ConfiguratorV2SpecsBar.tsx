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
  <div className="space-y-1 lg:space-y-3">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:gap-x-3 lg:gap-y-2">
      <h1 className="hidden text-lg font-medium leading-tight tracking-tight text-neutral-950 sm:block lg:text-[2rem]">
        {title}
      </h1>
      {year && (
        <span className="inline-flex items-center rounded-full border border-neutral-300 bg-[#FDFDFD] px-2.5 py-0.5 text-[13px] font-medium text-neutral-700">
          {year}
        </span>
      )}
    </div>
    {contextLine && (
      <p className="hidden text-xs leading-snug text-neutral-600 sm:block lg:text-[13px]">{contextLine}</p>
    )}
    {onLearnMore && (
      <button
        type="button"
        onClick={onLearnMore}
        className="hidden text-[13px] font-medium text-red-500 transition-colors hover:text-red-400 lg:inline"
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
    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-neutral-300 bg-[#FDFDFD] px-5 py-4 text-left transition-colors hover:border-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
  >
    <span className="min-w-0">
      <span className="block text-[15px] font-medium leading-snug tracking-tight text-neutral-950">
        Dowiedz się więcej o dywanikach EVA
      </span>
      <span className="mt-1 block text-[13px] leading-snug text-neutral-600">
        Poznaj materiał, strukturę komórek i wykończenie.
      </span>
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
  </button>
)
