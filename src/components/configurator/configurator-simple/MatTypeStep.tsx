"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MatTypeStepProps {
  config: {
    matType: "3d-with-rims" | "classic" | "single"
  }
  skipMatTypeStep?: boolean
  onUpdate: (updates: {
    matType?: "3d-with-rims" | "classic" | "single"
    variant?: string
  }) => void
  onNext: () => void
  onPrevious: () => void
}

const matTypes = [
  {
    id: "3d-with-rims" as const,
    name: "3D z rantami",
    description: "Dywaniki 3D z wysokimi rantami chroniącymi przed brudem",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Dywaniki standardowe bez wysokich rantów",
  },
];

export function MatTypeStep({
  config,
  skipMatTypeStep = false,
  onUpdate,
  onNext,
  onPrevious,
}: MatTypeStepProps) {
  if (skipMatTypeStep) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Dla tego pojazdu obowiązuje jeden typ kompletu. Przejdź do wyboru
          wariantu.
        </p>
        <div className="flex flex-col justify-end gap-2 pt-3 sm:flex-row">
          <Button onClick={onPrevious} variant="outline" className="border-white/10">
            Wstecz
          </Button>
          <Button onClick={onNext} className="bg-red-600 hover:bg-red-700">
            Dalej
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 [&>*]:min-w-[150px]">
        {matTypes.map((type) => (
          <Card
            key={type.id}
            onClick={() => onUpdate({ matType: type.id, variant: "" })}
            className={`
              p-3 md:p-4 cursor-pointer transition-all duration-300 min-h-[88px] md:min-h-[80px] active:scale-[0.98]
              ${config.matType === type.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                : 'border-white/10 bg-white/5 hover:border-white/10 hover:bg-neutral-750 hover:shadow-sm'
              }
            `}
          >
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-1 leading-tight">{type.name}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{type.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] md:min-h-[36px] border-white/10 hover:bg-white/5 text-xs font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-1.5 flex-1 sm:flex-initial">
          {!config.matType && (
            <p className="text-[10px] text-gray-400 text-right">Wybierz typ dywaników aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.matType}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] md:min-h-[36px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

