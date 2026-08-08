"use client"

import type { ConfiguratorV2Metric } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"

type ConfiguratorV2SpecsBarProps = {
  title: string
  metrics: ConfiguratorV2Metric[]
  contextLine?: string
}

/** Metryki w stylu Tesla — duże liczby, małe etykiety pod spodem */
export const ConfiguratorV2SpecsBar = ({
  title,
  metrics,
  contextLine,
}: ConfiguratorV2SpecsBarProps) => (
  <div className="space-y-3 lg:space-y-4">
    <div>
      <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold text-white tracking-tight">
        {title}
      </h1>
      {contextLine && (
        <p className="text-xs text-gray-400 mt-1 truncate">{contextLine}</p>
      )}
    </div>

    <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8 sm:gap-y-3 lg:justify-end">
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-[4rem]">
          <p
            className={`text-lg sm:text-xl lg:text-2xl font-semibold tabular-nums leading-none ${
              metric.label === "Cena" ? "text-green-400" : "text-white"
            }`}
          >
            {metric.value}
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1 leading-tight">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  </div>
)
