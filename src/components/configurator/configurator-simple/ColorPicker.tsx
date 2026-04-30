"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableColors, getColorInfo, getAvailableMaterialColorsForEdge } from "@/lib/color-mapping";

interface ColorPickerProps {
  type: "mat" | "edge";
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

export function ColorPicker({ type, config, onUpdate, onNext, onPrevious }: ColorPickerProps) {
  // Pobierz dostępne kolory w zależności od typu
  const availableColors = useMemo(() => {
    if (type === "mat") {
      // Dla koloru dywaników, uwzględnij wybrany kolor obszycia jeśli już został wybrany
      return getAvailableMaterialColorsForEdge(
        config.structure,
        config.matType,
        config.edgeColor || 'black'
      );
    } else {
      // Dla koloru obszycia
      return getAvailableColors(config.structure, 'border');
    }
  }, [type, config.structure, config.matType, config.edgeColor]);

  const selectedColor = type === "mat" ? config.color : config.edgeColor;

  const handleColorSelect = (colorKey: string) => {
    if (type === "mat") {
      onUpdate({ color: colorKey });
    } else {
      onUpdate({ edgeColor: colorKey });
      // Jeśli zmieniamy kolor obszycia, może trzeba zaktualizować dostępne kolory materiałów
      // Resetuj kolor materiału jeśli nie jest już dostępny
      const newAvailableMatColors = getAvailableMaterialColorsForEdge(
        config.structure,
        config.matType,
        colorKey
      );
      if (!newAvailableMatColors.includes(config.color)) {
        onUpdate({ color: newAvailableMatColors[0] || 'black' });
      }
    }
  };

  const isStepComplete = !!selectedColor;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 md:gap-4">
        {availableColors.map((colorKey) => {
          const colorInfo = getColorInfo(colorKey);
          const isSelected = selectedColor === colorKey;
          
          return (
            <button
              key={colorKey}
              onClick={() => handleColorSelect(colorKey)}
              className={`
                aspect-square rounded-lg border transition-all duration-300 min-w-[36px] min-h-[36px]
                ${isSelected
                  ? 'border-red-500 ring-2 ring-red-500/30 scale-105 shadow-md shadow-red-500/20'
                  : 'border-white/10 hover:border-white/10 hover:scale-105 active:scale-95'
                }
              `}
              style={{
                backgroundColor: colorInfo.color,
              }}
              title={colorInfo.name}
            >
              {isSelected && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-md">
                    <span className="text-white text-xs md:text-sm font-bold">✓</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedColor && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-white/10 shadow-sm"
              style={{ backgroundColor: getColorInfo(selectedColor).color }}
            />
            <div>
              <p className="text-xs md:text-sm text-gray-400 mb-0.5">
                {type === "mat" ? "Wybrany kolor dywaników" : "Wybrany kolor obszycia"}
              </p>
              <p className="text-base md:text-lg font-semibold text-white">{getColorInfo(selectedColor).name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-2.5 min-h-[40px] border-white/10 hover:bg-white/5 text-sm font-medium transition-all duration-200"
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

