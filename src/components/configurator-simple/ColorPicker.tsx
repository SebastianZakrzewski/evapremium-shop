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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {availableColors.map((colorKey) => {
          const colorInfo = getColorInfo(colorKey);
          const isSelected = selectedColor === colorKey;
          
          return (
            <button
              key={colorKey}
              onClick={() => handleColorSelect(colorKey)}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-red-500 ring-2 ring-red-500/20 scale-105'
                  : 'border-neutral-700 hover:border-neutral-600'
                }
              `}
              style={{
                backgroundColor: colorInfo.color,
              }}
              title={colorInfo.name}
            >
              {isSelected && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedColor && (
        <div className="p-4 bg-neutral-800 rounded-lg border border-neutral-700">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border border-neutral-700"
              style={{ backgroundColor: getColorInfo(selectedColor).color }}
            />
            <div>
              <p className="text-sm text-gray-400">
                {type === "mat" ? "Wybrany kolor dywaników" : "Wybrany kolor obszycia"}
              </p>
              <p className="text-lg font-semibold">{getColorInfo(selectedColor).name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end pt-4">
        <Button
          onClick={onPrevious}
          variant="outline"
          className="px-6 py-3 border-neutral-700 hover:bg-neutral-800"
        >
          Wstecz
        </Button>
        <Button
          onClick={onNext}
          disabled={!isStepComplete}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dalej
        </Button>
      </div>
    </div>
  );
}

