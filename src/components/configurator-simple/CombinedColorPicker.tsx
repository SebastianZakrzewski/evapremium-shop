"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableColors, getColorInfo, getAvailableMaterialColorsForEdge } from "@/lib/color-mapping";

interface CombinedColorPickerProps {
  config: {
    structure: "diamonds" | "honey";
    matType: "3d-with-rims" | "classic";
    color: string;
    edgeColor: string;
  };
  onUpdate: (updates: { color?: string; edgeColor?: string }) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function CombinedColorPicker({ config, onUpdate, onNext, onPrevious }: CombinedColorPickerProps) {
  // Pobierz dostępne kolory materiału na podstawie wybranego koloru obszycia
  const availableMatColors = useMemo(() => {
    return getAvailableMaterialColorsForEdge(
      config.structure,
      config.matType,
      config.edgeColor || 'black'
    );
  }, [config.structure, config.matType, config.edgeColor]);

  // Pobierz dostępne kolory obszycia
  const availableEdgeColors = useMemo(() => {
    return getAvailableColors(config.structure, 'border');
  }, [config.structure]);

  const handleMatColorSelect = (colorKey: string) => {
    onUpdate({ color: colorKey });
  };

  const handleEdgeColorSelect = (colorKey: string) => {
    onUpdate({ edgeColor: colorKey });
    // Jeśli zmieniamy kolor obszycia, resetuj kolor materiału jeśli nie jest już dostępny
    const newAvailableMatColors = getAvailableMaterialColorsForEdge(
      config.structure,
      config.matType,
      colorKey
    );
    if (!newAvailableMatColors.includes(config.color)) {
      onUpdate({ color: newAvailableMatColors[0] || 'black' });
    }
  };

  const isStepComplete = !!(config.color && config.edgeColor);

  return (
    <div className="space-y-6">
      {/* Kolor dywaników */}
      <div className="space-y-2">
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-gray-200">Kolor dywaników</h4>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 xl:grid-cols-16 gap-1.5">
            {availableMatColors.map((colorKey) => {
              const colorInfo = getColorInfo(colorKey);
              const isSelected = config.color === colorKey;
              
              return (
                <button
                  key={colorKey}
                  onClick={() => handleMatColorSelect(colorKey)}
                  className={`
                    aspect-square rounded border transition-all duration-300 min-w-[18px] min-h-[18px]
                    ${isSelected
                      ? 'border-red-500 ring-1 ring-red-500/40 scale-110'
                      : 'border-neutral-700 hover:border-neutral-600 hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{
                    backgroundColor: colorInfo.color,
                  }}
                  title={colorInfo.name}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {config.color && (
            <div className="mt-1.5 p-1.5 bg-neutral-800 rounded border border-neutral-700">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded border border-neutral-600"
                  style={{ backgroundColor: getColorInfo(config.color).color }}
                />
                <div>
                  <p className="text-[9px] text-gray-400 mb-0.5">Wybrany kolor dywaników</p>
                  <p className="text-[10px] font-semibold text-white">{getColorInfo(config.color).name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kolor obszycia */}
      <div className="space-y-2">
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-gray-200">Kolor obszycia</h4>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 xl:grid-cols-16 gap-1.5">
            {availableEdgeColors.map((colorKey) => {
              const colorInfo = getColorInfo(colorKey);
              const isSelected = config.edgeColor === colorKey;
              
              return (
                <button
                  key={colorKey}
                  onClick={() => handleEdgeColorSelect(colorKey)}
                  className={`
                    aspect-square rounded border transition-all duration-300 min-w-[18px] min-h-[18px]
                    ${isSelected
                      ? 'border-red-500 ring-1 ring-red-500/40 scale-110'
                      : 'border-neutral-700 hover:border-neutral-600 hover:scale-105 active:scale-95'
                    }
                  `}
                  style={{
                    backgroundColor: colorInfo.color,
                  }}
                  title={colorInfo.name}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {config.edgeColor && (
            <div className="mt-1.5 p-1.5 bg-neutral-800 rounded border border-neutral-700">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded border border-neutral-600"
                  style={{ backgroundColor: getColorInfo(config.edgeColor).color }}
                />
                <div>
                  <p className="text-[9px] text-gray-400 mb-0.5">Wybrany kolor obszycia</p>
                  <p className="text-[10px] font-semibold text-white">{getColorInfo(config.edgeColor).name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
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
          disabled={!isStepComplete}
          className="px-6 py-2.5 min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

