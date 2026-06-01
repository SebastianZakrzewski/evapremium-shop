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
                p-2.5 md:p-3 cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 h-full text-center
                rounded-xl border border-white/10 bg-[#111] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50
                ${isSelected
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10'
                  : 'hover:border-white/20 hover:bg-white/5 active:scale-[0.98]'
                }
              `}
            >
              <div className="w-full space-y-0.5">
                <h3 className="text-sm font-semibold leading-tight text-white">{structure.name}</h3>
                <p className="text-xs leading-snug text-gray-300">{structure.description}</p>
              </div>
              <div className="flex justify-center flex-shrink-0">
                <div className="w-fit max-w-full rounded-xl overflow-hidden bg-white/5">
                  <Image
                    src={structure.image}
                    alt={structure.name}
                    width={120}
                    height={80}
                    className="block h-auto w-auto max-h-[80px] md:max-h-[96px] object-contain p-1 md:p-2"
                    sizes="(max-width: 768px) 50vw, 120px"
                  />
                </div>
              </div>
            </button>
          );
        })}
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

