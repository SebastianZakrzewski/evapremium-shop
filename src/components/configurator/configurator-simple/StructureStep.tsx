"use client";

import React from "react";
import Image from "next/image";
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
    description: "Klasyczny wygląd",
    image: "/images/konfigurator/struktura komorek/romby.png",
  },
  {
    id: "honey" as const,
    name: "Plaster miodu",
    description: "Nowoczesny design",
    image: "/images/konfigurator/struktura komorek/plaster.png",
  },
];

export function StructureStep({ config, onUpdate, onNext, onPrevious }: StructureStepProps) {
  return (
    <div className="space-y-3 md:space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 [&>*]:min-w-[150px]">
        {structures.map((structure) => (
          <Card
            key={structure.id}
            onClick={() => onUpdate({ structure: structure.id })}
            className={`
              p-2 md:p-3 cursor-pointer transition-all duration-300 flex flex-col active:scale-[0.98]
              ${config.structure === structure.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
              }
            `}
          >
            <div className="h-[40px] md:h-[44px] flex-shrink-0 flex flex-col justify-center">
              <h3 className="text-xs md:text-sm font-semibold leading-tight truncate">{structure.name}</h3>
              <p className="text-gray-300 text-[10px] leading-tight line-clamp-1">{structure.description}</p>
            </div>
            <div className="w-full h-[80px] md:h-[96px] flex-shrink-0 mt-2 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-md overflow-hidden border border-neutral-700 relative">
              <Image
                src={structure.image}
                alt={structure.name}
                fill
                className="object-contain p-1 md:p-2"
                sizes="(max-width: 768px) 50vw, 200px"
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2 flex-1 sm:flex-initial">
          {!config.structure && (
            <p className="text-xs text-gray-400 text-right">Wybierz strukturę aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.structure}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

