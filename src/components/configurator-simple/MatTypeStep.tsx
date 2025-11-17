"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MatTypeStepProps {
  config: {
    matType: "3d-with-rims" | "classic" | "";
  };
  onUpdate: (updates: { matType?: "3d-with-rims" | "classic" }) => void;
  onNext: () => void;
  onPrevious: () => void;
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

export function MatTypeStep({ config, onUpdate, onNext, onPrevious }: MatTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {matTypes.map((type) => (
          <Card
            key={type.id}
            onClick={() => onUpdate({ matType: type.id })}
            className={`
              p-4 md:p-5 cursor-pointer transition-all duration-300
              ${config.matType === type.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
              }
            `}
          >
            <div>
              <h3 className="text-lg md:text-xl font-semibold mb-1.5 leading-tight">{type.name}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{type.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-2.5 min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200"
        >
          Wstecz
        </Button>
        <Button
          onClick={onNext}
          disabled={!config.matType}
          className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

