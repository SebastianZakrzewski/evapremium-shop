"use client"

type ConfiguratorV2SpecsBarProps = {
  title: string
  year?: string
  contextLine?: string
}

export const ConfiguratorV2SpecsBar = ({
  title,
  year,
  contextLine,
}: ConfiguratorV2SpecsBarProps) => (
  <div className="space-y-1 lg:space-y-3">
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:gap-x-3 lg:gap-y-2">
      <h1 className="text-base font-medium leading-tight tracking-tight text-neutral-950 sm:text-lg lg:text-[2rem]">
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
  </div>
)
