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
          {/* Grid Layout - Mobile i Desktop */}
          <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 md:gap-1.5">
            {availableMatColors.map((colorKey) => {
              const colorInfo = getColorInfo(colorKey);
              const isSelected = config.color === colorKey;
              
              return (
                <button
                  key={colorKey}
                  onClick={() => handleMatColorSelect(colorKey)}
                  className={`
                    aspect-square rounded-lg border transition-all duration-300 min-w-[36px] min-h-[36px] md:min-w-[18px] md:min-h-[18px]
                    ${isSelected
                      ? 'border-red-500 ring-2 ring-red-500/40 md:ring-1 scale-105 md:scale-110'
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
                      <div className="w-4 h-4 md:w-2 md:h-2 rounded-full bg-white/90 md:bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <span className="text-red-600 md:text-white text-xs md:text-[8px] font-bold">✓</span>
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
          {/* Grid Layout - Mobile i Desktop */}
          <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 md:gap-1.5">
            {availableEdgeColors.map((colorKey) => {
              const colorInfo = getColorInfo(colorKey);
              const isSelected = config.edgeColor === colorKey;
              
              return (
                <button
                  key={colorKey}
                  onClick={() => handleEdgeColorSelect(colorKey)}
                  className={`
                    aspect-square rounded-lg border transition-all duration-300 min-w-[36px] min-h-[36px] md:min-w-[18px] md:min-h-[18px]
                    ${isSelected
                      ? 'border-red-500 ring-2 ring-red-500/40 md:ring-1 scale-105 md:scale-110'
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
                      <div className="w-4 h-4 md:w-2 md:h-2 rounded-full bg-white/90 md:bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <span className="text-red-600 md:text-white text-xs md:text-[8px] font-bold">✓</span>
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
          className="flex-1 sm:flex-initial px-6 py-3 min-h-[44px] md:min-h-[40px] border-neutral-700 hover:bg-neutral-800 text-sm font-medium transition-all duration-200 active:scale-95"
        >
          Wstecz
        </Button>
        <div className="flex flex-col items-end gap-2 flex-1 sm:flex-initial">
          {!isStepComplete && (
            <p className="text-xs text-gray-400 text-right">
              {!config.color && !config.edgeColor && "Wybierz kolory aby kontynuować"}
              {config.edgeColor && !config.color && "Wybierz kolor materiału aby kontynuować"}
              {config.color && !config.edgeColor && "Wybierz kolor obszycia aby kontynuować"}
            </p>
          )}
          <Button
            onClick={onNext}
            disabled={!isStepComplete}
            className="w-full sm:w-auto px-6 py-3 min-h-[44px] md:min-h-[40px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            Dalej
          </Button>
        </div>
      </div>
    </div>
  );
}

