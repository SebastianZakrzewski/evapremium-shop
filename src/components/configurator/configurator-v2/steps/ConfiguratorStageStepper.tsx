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
    "flex min-h-11 w-full items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
  if (stage.status === "current") {
    return `${base} border-neutral-950 bg-neutral-950 text-white`
  }
  if (stage.status === "completed") {
    return `${base} border-neutral-950 bg-[#FDFDFD] text-neutral-950`
  }
  if (stage.status === "available") {
    return `${base} border-neutral-400 bg-[#FDFDFD] text-neutral-950`
  }
  return `${base} cursor-not-allowed border-neutral-200 bg-[#FDFDFD] text-neutral-400`
}

export const ConfiguratorStageStepper = ({
  stages,
  onOpen,
}: ConfiguratorStageStepperProps) => (
  <nav aria-label="Etapy konfiguracji" className="bg-[#FDFDFD] text-neutral-950">
    <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {stages.map((stage) => {
        const statusLabel = stageStatusLabel(stage.status)
        return (
          <li key={stage.id}>
            <button
              type="button"
              className={stageButtonClass(stage)}
              aria-current={stage.status === "current" ? "step" : undefined}
              aria-disabled={stage.canOpen ? undefined : true}
              aria-label={`${stage.id}. ${stage.name}, ${statusLabel}`}
              onClick={() => {
                if (!stage.canOpen) return
                onOpen(stage.id)
              }}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  stage.status === "current"
                    ? "bg-white text-neutral-950"
                    : "bg-neutral-100 text-current"
                }`}
                aria-hidden
              >
                {stage.id}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-tight">
                  {stage.name}
                </span>
                <span className="block text-[11px] leading-tight opacity-80">
                  {statusLabel}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  </nav>
)
