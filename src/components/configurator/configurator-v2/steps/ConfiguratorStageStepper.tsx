"use client"

import {
  stageStatusLabel,
  type StageSnapshot,
} from "./configuratorStages"

type ConfiguratorStageStepperProps = {
  stages: StageSnapshot[]
  onOpen: (stageId: StageSnapshot["id"]) => void
}

const stageButtonClass = (stage: StageSnapshot): string => {
  const base =
    "flex h-8 max-w-full min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
  const width =
    stage.status === "current"
      ? "w-max px-2.5 lg:w-full"
      : "w-full px-0 lg:px-1.5"
  if (stage.status === "current") {
    return `${base} ${width} border-red-600 bg-red-600 text-white`
  }
  if (stage.status === "completed") {
    return `${base} ${width} border-red-600 bg-[#FDFDFD] text-red-600`
  }
  if (stage.status === "available") {
    return `${base} ${width} border-red-600 bg-[#FDFDFD] text-red-600`
  }
  return `${base} ${width} cursor-not-allowed border-red-200 bg-[#FDFDFD] text-red-300`
}

export const ConfiguratorStageStepper = ({
  stages,
  onOpen,
}: ConfiguratorStageStepperProps) => (
  <nav aria-label="Etapy konfiguracji" className="bg-[#FDFDFD] text-neutral-950">
    <ol className="flex min-w-0 items-center gap-2">
      {stages.map((stage) => {
        const statusLabel = stageStatusLabel(stage.status)
        const isCurrent = stage.status === "current"
        return (
          <li
            key={stage.id}
            className={
              isCurrent
                ? "min-w-0 max-w-[calc(100%-10rem)] shrink overflow-hidden lg:max-w-none lg:flex-1"
                : "w-8 shrink-0 overflow-hidden lg:w-auto lg:min-w-0 lg:flex-1"
            }
          >
            <button
              type="button"
              className={stageButtonClass(stage)}
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={stage.canOpen ? undefined : true}
              aria-label={`${stage.id}. ${stage.name}, ${statusLabel}`}
              onClick={() => {
                if (!stage.canOpen) return
                onOpen(stage.id)
              }}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isCurrent
                    ? "bg-white text-red-600"
                    : "bg-red-50 text-current"
                }`}
                aria-hidden
              >
                {stage.id}
              </span>
              <span
                className={`min-w-0 truncate text-[11px] font-medium leading-none ${
                  isCurrent ? "" : "hidden lg:block"
                }`}
              >
                {stage.name}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  </nav>
)
