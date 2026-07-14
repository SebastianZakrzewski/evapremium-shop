"use client"

import type { ConfiguratorV2Metric } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"

type ConfiguratorV2SpecsBarProps = {
  title: string
  metrics: ConfiguratorV2Metric[]
  contextLine?: string
}

export const ConfiguratorV2SpecsBar = ({
  title,
  metrics,
  contextLine,
}: ConfiguratorV2SpecsBarProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-xs uppercase tracking-widest text-red-500 font-semibold mb-0.5">
        Konfigurator V2
      </p>
      <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
      {contextLine && (
        <p className="text-xs text-gray-400 mt-1 truncate max-w-md">{contextLine}</p>
      )}
    </div>
    <div className="flex gap-6 sm:gap-8">
      {metrics.map((metric) => (
        <div key={metric.label} className="text-center sm:text-right min-w-0">
          <p className="text-lg sm:text-xl font-semibold text-white truncate">
            {metric.value}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  </div>
)
