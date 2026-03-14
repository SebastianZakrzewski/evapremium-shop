"use client";

import React, { useMemo } from "react";
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

  // Sprawdź czy wybrany kolor jest dostępny dla każdej struktury
  const isStructureAvailable = useMemo(() => {
    if (!config.color || !config.edgeColor) {
      // Jeśli nie wybrano koloru, wszystkie struktury są dostępne
      return { diamonds: true, honey: true };
    }

    // Sprawdź dostępność koloru dla każdej struktury
    const diamondsColors = getAvailableMaterialColorsForEdge(
      'diamonds',
      config.matType || '3d-with-rims',
      config.edgeColor
    );
    const honeyColors = getAvailableMaterialColorsForEdge(
      'honey',
      config.matType || '3d-with-rims',
      config.edgeColor
    );

    return {
      diamonds: diamondsColors.includes(config.color),
      honey: honeyColors.includes(config.color),
    };
  }, [config.color, config.edgeColor, config.matType]);

  return (
    <div className="space-y-6">
      {/* Struktura */}
      <div>
        <h3 className="text-base font-semibold mb-2 text-white/90">Struktura komórek</h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {structures.map((structure) => {
            const isAvailable = isStructureAvailable[structure.id];
            const isSelected = config.structure === structure.id;
            const isDisabled = !isAvailable && config.color && config.edgeColor;

            return (
              <Card
                key={structure.id}
                onClick={() => {
                  if (!isDisabled) {
                    // Jeśli zmieniamy strukturę i kolor nie jest dostępny dla nowej struktury, zresetuj kolor
                    const newAvailableColors = getAvailableMaterialColorsForEdge(
                      structure.id,
                      config.matType || '3d-with-rims',
                      config.edgeColor || 'black'
                    );
                    if (config.color && !newAvailableColors.includes(config.color)) {
                      onUpdate({ 
                        structure: structure.id,
                        color: newAvailableColors[0] || 'black'
                      });
                    } else {
                      onUpdate({ structure: structure.id });
                    }
                  }
                }}
                className={`
                  p-1.5 sm:p-3 transition-all duration-300 flex flex-col h-full min-h-[70px] sm:min-h-[120px] relative
                  ${isSelected
                    ? 'border-red-500 bg-red-500/10 ring-1 sm:ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-[1.01]'
                    : isDisabled
                    ? 'border-white/10 bg-[#111]/50 opacity-50 cursor-not-allowed'
                    : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-white/5 hover:shadow-sm cursor-pointer active:scale-[0.98]'
                  }
                `}
              >
              <div className="space-y-0.5 sm:space-y-1.5 flex flex-col h-full">
                <div className="flex-shrink-0">
                  <h4 className="text-[11px] sm:text-base font-semibold mb-0 sm:mb-1 leading-tight">{structure.name}</h4>
                  <p className="text-gray-300 text-[9px] sm:text-sm leading-tight sm:leading-relaxed">{structure.description}</p>
                </div>
                <div 
                  className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded sm:rounded-md overflow-hidden border border-white/10 relative flex-1 min-h-0"
                >
                  <Image
                    src={structure.image}
                    alt={structure.name}
                    fill
                    className="object-contain p-0.5 sm:p-1.5"
                    sizes="(max-width: 768px) 50vw, 50vw"
                  />
                </div>
              </div>
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                  <p className="text-xs text-gray-400 text-center px-2">
                    Kolor niedostępny dla tej struktury
                  </p>
                </div>
              )}
            </Card>
            );
          })}
        </div>
      </div>

      {/* Kolory */}
      {config.structure && (
        <>
          {/* Kolor materiału */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white/90">Kolor materiału</h3>
            <div className="overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              <RadioGroup
                value={config.color}
                onValueChange={(value) => onUpdate({ color: value })}
                className="flex sm:grid sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-3 min-w-max sm:min-w-0"
              >
                {availableMatColors.map((colorKey) => {
                  const colorInfo = getColorInfo(colorKey);
                  return (
                    <div key={colorKey} className="flex flex-col items-center gap-0.5 sm:gap-2 flex-shrink-0 sm:flex-shrink">
                      <Label
                        htmlFor={`material-${colorKey}`}
                        className={`
                          relative w-14 h-14 sm:w-full aspect-square rounded sm:rounded-lg overflow-hidden border sm:border-2 cursor-pointer transition-all duration-200
                          ${config.color === colorKey
                            ? 'border-red-500 ring-1 sm:ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-105'
                            : 'border-white/10 hover:border-white/20 active:scale-95'
                          }
                        `}
                      >
                        <RadioGroupItem value={colorKey} id={`material-${colorKey}`} className="sr-only" />
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: colorInfo.color }}
                        />
                      </Label>
                      <span className="text-[9px] sm:text-xs text-gray-400 text-center leading-tight whitespace-nowrap">{colorInfo.name}</span>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          {/* Kolor obszycia */}
          {config.color && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white/90">Kolor obszycia</h3>
              <div className="overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
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
                  className="flex sm:grid sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-3 min-w-max sm:min-w-0"
                >
                  {availableEdgeColors.map((colorKey) => {
                    const colorInfo = getColorInfo(colorKey);
                    return (
                      <div key={colorKey} className="flex flex-col items-center gap-0.5 sm:gap-2 flex-shrink-0 sm:flex-shrink">
                        <Label
                          htmlFor={`edge-${colorKey}`}
                          className={`
                            relative w-14 h-14 sm:w-full aspect-square rounded sm:rounded-lg overflow-hidden border sm:border-2 cursor-pointer transition-all duration-200
                            ${config.edgeColor === colorKey
                              ? 'border-red-500 ring-1 sm:ring-2 ring-red-500/30 shadow-md shadow-red-500/10 scale-105'
                              : 'border-white/10 hover:border-white/20 active:scale-95'
                            }
                          `}
                        >
                          <RadioGroupItem value={colorKey} id={`edge-${colorKey}`} className="sr-only" />
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: colorInfo.color }}
                          />
                        </Label>
                        <span className="text-[9px] sm:text-xs text-gray-400 text-center leading-tight whitespace-nowrap">{colorInfo.name}</span>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}
        </>
      )}


      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-white/10 hover:bg-white/5 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2 flex-1 sm:flex-initial">
          {(!config.structure || !config.color || !config.edgeColor) && (
            <p className="text-xs text-gray-400 text-right">Wybierz strukturę i kolory aby kontynuować</p>
          )}
          <Button
            onClick={onNext}
            disabled={!config.structure || !config.color || !config.edgeColor}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

