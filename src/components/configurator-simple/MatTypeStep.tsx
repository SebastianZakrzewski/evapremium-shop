"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MatTypeStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
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
    image: "/images/mats/3d-with-rims.jpg",
  },
  {
    id: "classic" as const,
    name: "3D bez rantów",
    description: "Dywaniki standardowe bez wysokich rantów",
    image: "/images/mats/classic.jpg",
  },
];

export function MatTypeStep({ config, onUpdate, onNext, onPrevious }: MatTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matTypes.map((type) => (
          <Card
            key={type.id}
            onClick={() => onUpdate({ matType: type.id })}
            className={`
              p-6 cursor-pointer transition-all duration-200
              ${config.matType === type.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }
            `}
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{type.name}</h3>
              <p className="text-gray-400 text-sm">{type.description}</p>
              <div className="aspect-video bg-neutral-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Podgląd</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-3 border-neutral-700 hover:bg-neutral-800"
        >
          Wstecz
        </Button>
        <Button
          onClick={onNext}
          disabled={!config.matType}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

