"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getColorInfo, getAvailableColors, getAvailableMaterialColorsForEdge } from "@/lib/color-mapping";

interface StructureColorStepProps {
  config: {
    matType: "3d-with-rims" | "classic";
    structure: "diamonds" | "honey";
    color: string;
    edgeColor: string;
  };
  onUpdate: (updates: { structure?: "diamonds" | "honey"; color?: string; edgeColor?: string }) => void;
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

export function StructureColorStep({ config, onUpdate, onNext, onPrevious }: StructureColorStepProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Pobierz dostępne kolory materiału na podstawie wybranego koloru obszycia
  const availableMatColors = useMemo(() => {
    if (!config.structure || !config.edgeColor) return [];
    return getAvailableMaterialColorsForEdge(
      config.structure,
      config.matType || '3d-with-rims',
      config.edgeColor || 'black'
    );
  }, [config.structure, config.matType, config.edgeColor]);

  // Pobierz dostępne kolory obszycia
  const availableEdgeColors = useMemo(() => {
    if (!config.structure) return [];
    return getAvailableColors(config.structure, 'border');
  }, [config.structure]);

  return (
    <div className="space-y-6">
      {/* Struktura */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-white/90">Struktura komórek</h3>
        <div className="grid grid-cols-2 gap-3">
          {structures.map((structure) => (
            <Card
              key={structure.id}
              onClick={() => onUpdate({ structure: structure.id })}
              className={`
                p-4 cursor-pointer transition-all duration-300 flex flex-col h-full min-h-[140px] active:scale-[0.98]
                ${config.structure === structure.id
                  ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-750 hover:shadow-sm'
                }
              `}
            >
              <div className="space-y-2 flex flex-col h-full">
                <div className="flex-shrink-0">
                  <h4 className="text-base font-semibold mb-1 leading-tight">{structure.name}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{structure.description}</p>
                </div>
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedImage(structure.image);
                  }}
                  className="aspect-video bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-md overflow-hidden border border-neutral-700 relative cursor-zoom-in hover:border-red-500/50 transition-colors flex-1 min-h-0"
                >
                  <Image
                    src={structure.image}
                    alt={structure.name}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 50vw, 50vw"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Kolory */}
      {config.structure && (
        <>
          {/* Kolor materiału */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white/90">Kolor materiału</h3>
            <RadioGroup
              value={config.color}
              onValueChange={(value) => onUpdate({ color: value })}
              className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
            >
              {availableMatColors.map((colorKey) => {
                const colorInfo = getColorInfo(colorKey);
                return (
                  <div key={colorKey} className="flex flex-col items-center gap-2">
                    <Label
                      htmlFor={`material-${colorKey}`}
                      className={`
                        relative w-full aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200
                        ${config.color === colorKey
                          ? 'border-red-500 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-105'
                          : 'border-neutral-700 hover:border-neutral-600 active:scale-95'
                        }
                      `}
                    >
                      <RadioGroupItem value={colorKey} id={`material-${colorKey}`} className="sr-only" />
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: colorInfo.color }}
                      />
                    </Label>
                    <span className="text-xs text-gray-400 text-center">{colorInfo.name}</span>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Kolor obszycia */}
          {config.color && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white/90">Kolor obszycia</h3>
              <RadioGroup
                value={config.edgeColor}
                onValueChange={(value) => {
                  onUpdate({ edgeColor: value });
                  // Resetuj kolor materiału jeśli nie jest dostępny dla nowego koloru obszycia
                  const newAvailableMatColors = getAvailableMaterialColorsForEdge(
                    config.structure,
                    config.matType || '3d-with-rims',
                    value
                  );
                  if (!newAvailableMatColors.includes(config.color)) {
                    onUpdate({ color: newAvailableMatColors[0] || 'black' });
                  }
                }}
                className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
              >
                {availableEdgeColors.map((colorKey) => {
                  const colorInfo = getColorInfo(colorKey);
                  return (
                    <div key={colorKey} className="flex flex-col items-center gap-2">
                      <Label
                        htmlFor={`edge-${colorKey}`}
                        className={`
                          relative w-full aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200
                          ${config.edgeColor === colorKey
                            ? 'border-red-500 ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-105'
                            : 'border-neutral-700 hover:border-neutral-600 active:scale-95'
                          }
                        `}
                      >
                        <RadioGroupItem value={colorKey} id={`edge-${colorKey}`} className="sr-only" />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: colorInfo.color }}
                        />
                      </Label>
                      <span className="text-xs text-gray-400 text-center">{colorInfo.name}</span>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}
        </>
      )}

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
          className="px-6 py-3 min-h-[44px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2">
          {(!config.structure || !config.color || !config.edgeColor) && (
            <p className="text-xs text-gray-400 text-right">Wybierz strukturę i kolory aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.structure || !config.color || !config.edgeColor}
            className="px-6 py-3 min-h-[44px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

