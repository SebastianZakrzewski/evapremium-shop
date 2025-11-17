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
    description: "Struktura rombowa - klasyczny wygląd",
    image: "/images/konfigurator/struktura komorek/romby.png",
  },
  {
    id: "honey" as const,
    name: "Plaster miodu",
    description: "Struktura plastra miodu - nowoczesny design",
    image: "/images/konfigurator/struktura komorek/plaster.png",
  },
];

export function StructureStep({ config, onUpdate, onNext, onPrevious }: StructureStepProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedImage(structure.image);
                }}
                className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-lg overflow-hidden border border-neutral-700 relative cursor-zoom-in hover:border-red-500/50 transition-colors"
              >
                <Image
                  src={structure.image}
                  alt={structure.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-xs text-white opacity-0 hover:opacity-100 transition-opacity">
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

