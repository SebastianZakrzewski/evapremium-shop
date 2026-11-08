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
    "flex h-11 w-full items-center justify-center gap-1.5 rounded-full border px-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
  if (stage.status === "current") {
    return `${base} border-red-600 bg-red-600 text-white`
  }
  if (stage.status === "completed") {
    return `${base} border-red-600 bg-[#FDFDFD] text-red-600`
  }
  if (stage.status === "available") {
    return `${base} border-red-600 bg-[#FDFDFD] text-red-600`
  }
  return `${base} cursor-not-allowed border-red-200 bg-[#FDFDFD] text-red-300`
}

export const ConfiguratorStageStepper = ({
  stages,
  onOpen,
}: ConfiguratorStageStepperProps) => (
  <nav aria-label="Etapy konfiguracji" className="bg-[#FDFDFD] text-neutral-950">
    <ol className="flex items-stretch gap-1">
      {stages.map((stage) => {
        const statusLabel = stageStatusLabel(stage.status)
        const isCurrent = stage.status === "current"
        return (
          <li key={stage.id} className={isCurrent ? "min-w-0 flex-1" : "w-11 shrink-0 lg:min-w-0 lg:flex-1"}>
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
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  isCurrent
                    ? "bg-white text-red-600"
                    : "bg-red-50 text-current"
                }`}
                aria-hidden
              >
                {stage.id}
              </span>
              <span
                className={`min-w-0 truncate text-[12px] font-medium leading-none ${
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
