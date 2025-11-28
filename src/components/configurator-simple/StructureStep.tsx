"use client";

import React, { useState } from "react";
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
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <div className="space-y-3 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-5">
        {structures.map((structure) => (
          <Card
            key={structure.id}
            onClick={() => onUpdate({ structure: structure.id })}
            className={`
              p-3 md:p-5 cursor-pointer transition-all duration-300 md:flex md:flex-col md:h-full min-h-[140px] md:min-h-[120px] active:scale-[0.98]
              ${config.structure === structure.id
                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
              }
            `}
          >
            <div className="space-y-1.5 md:space-y-3 md:flex md:flex-col md:h-full">
              <div className="md:flex-shrink-0">
                <h3 className="text-sm md:text-xl font-semibold mb-0.5 md:mb-1.5 leading-tight">{structure.name}</h3>
                <p className="text-gray-300 text-[10px] md:text-sm leading-tight md:leading-relaxed line-clamp-1 md:line-clamp-none">{structure.description}</p>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(structure.image);
                }}
                className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-md md:rounded-lg overflow-hidden border border-neutral-700 relative cursor-zoom-in hover:border-red-500/50 transition-colors md:flex-1 md:min-h-0"
              >
                <Image
                  src={structure.image}
                  alt={structure.name}
                  fill
                  className="object-contain p-1 md:p-2"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] md:text-xs text-white opacity-0 hover:opacity-100 transition-opacity">
                  Kliknij, aby powiększyć
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal z powiększonym zdjęciem */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setExpandedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-neutral-900 rounded-lg border border-neutral-800 shadow-2xl p-6 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {structures.find(s => s.image === expandedImage)?.name}
              </h3>
              <button
                onClick={() => setExpandedImage(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>
            <div className="relative aspect-video bg-neutral-950 rounded-lg overflow-hidden border border-neutral-700">
              <Image
                src={expandedImage}
                alt={structures.find(s => s.image === expandedImage)?.name || 'Struktura'}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-3 min-h-[44px] md:min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2">
          {!config.structure && (
            <p className="text-xs text-gray-400 text-right">Wybierz strukturę aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.structure}
            className="px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

