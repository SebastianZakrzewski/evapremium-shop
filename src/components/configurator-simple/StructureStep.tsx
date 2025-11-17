"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StructureStepProps {
  config: {
    structure: "diamonds" | "honey";
  };
  onUpdate: (updates: { structure?: "diamonds" | "honey" }) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const structures = [
  {
    id: "diamonds" as const,
    name: "Romby",
    description: "Struktura rombowa - klasyczny wygląd",
    image: "/images/structures/diamonds.jpg",
  },
  {
    id: "honey" as const,
    name: "Plaster miodu",
    description: "Struktura plastra miodu - nowoczesny design",
    image: "/images/structures/honey.jpg",
  },
];

export function StructureStep({ config, onUpdate, onNext, onPrevious }: StructureStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {structures.map((structure) => (
          <Card
            key={structure.id}
            onClick={() => onUpdate({ structure: structure.id })}
            className={`
              p-4 md:p-5 cursor-pointer transition-all duration-300
              ${config.structure === structure.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
              }
            `}
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1.5 leading-tight">{structure.name}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{structure.description}</p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg flex items-center justify-center border border-neutral-700">
                <span className="text-gray-400 text-sm">Podgląd struktury</span>
              </div>
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
          disabled={!config.structure}
          className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

