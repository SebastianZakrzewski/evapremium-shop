"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:gap-3 [&>*]:min-w-[150px] [&>*]:min-h-0 items-stretch">
        {structures.map((structure) => {
          const isSelected = config.structure === structure.id;
          return (
            <button
              key={structure.id}
              type="button"
              onClick={() => onUpdate({ structure: structure.id })}
              className={`
                p-2.5 md:p-3 cursor-pointer transition-all duration-300 grid grid-rows-[auto_1fr] h-full text-left
                rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                ${isSelected
                  ? 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-black scale-[1.01]'
                  : 'hover:opacity-90 active:scale-[0.98]'
                }
              `}
            >
              <div className="h-[44px] md:h-[48px] flex-shrink-0 flex flex-col justify-center min-h-0">
                <h3 className="text-xs md:text-sm font-semibold leading-tight truncate">{structure.name}</h3>
                <p className="text-gray-300 text-[10px] leading-tight line-clamp-2">{structure.description}</p>
              </div>
              <div className="w-full min-h-[80px] md:min-h-[96px] mt-1.5 rounded-xl overflow-hidden bg-neutral-800/40 relative">
                <Image
                  src={structure.image}
                  alt={structure.name}
                  fill
                  className="object-contain p-1 md:p-2 rounded-2xl"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[40px] md:min-h-[36px] border-neutral-700 hover:bg-neutral-800 text-xs font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-1.5 flex-1 sm:flex-initial">
          {!config.structure && (
            <p className="text-[10px] text-gray-400 text-right">Wybierz strukturę aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.structure}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] md:min-h-[36px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

