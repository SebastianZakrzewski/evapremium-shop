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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {structures.map((structure) => (
          <Card
            key={structure.id}
            onClick={() => onUpdate({ structure: structure.id })}
            className={`
              p-6 cursor-pointer transition-all duration-200
              ${config.structure === structure.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }
            `}
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{structure.name}</h3>
              <p className="text-gray-400 text-sm">{structure.description}</p>
              <div className="aspect-video bg-neutral-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Podgląd struktury</span>
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
          disabled={!config.structure}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

