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
  <div className="space-y-2 lg:space-y-4">
    <div>
      <h1 className="text-lg sm:text-xl lg:text-[1.75rem] font-semibold text-white tracking-tight">
        {title}
      </h1>
      {contextLine && (
        <p className="text-[11px] lg:text-xs text-gray-400 mt-0.5 lg:mt-1 truncate">
          {contextLine}
        </p>
      )}
    </div>

    <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:gap-x-6 sm:gap-y-2 lg:gap-x-8 lg:gap-y-3 lg:justify-end">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`min-w-[3.5rem] lg:min-w-[4rem] ${
            metric.label === "Cena" ? "hidden lg:block" : ""
          }`}
        >
          <p
            className={`text-base sm:text-lg lg:text-2xl font-semibold tabular-nums leading-none ${
              metric.label === "Cena" ? "text-green-400" : "text-white"
            }`}
          >
            {metric.value}
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 lg:mt-1 leading-tight">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  </div>
)
